/**
 * LinkedIn OAuth 2.0 + UGC Publishing Service
 */
const { encrypt, decrypt } = require('./crypto');

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || 'https://ainspiration.eu/api/linkedin/callback';
const LINKEDIN_SCOPES = 'openid profile w_member_social';

/**
 * Generate LinkedIn OAuth authorization URL
 */
function getAuthUrl(state) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: LINKEDIN_CLIENT_ID,
    redirect_uri: LINKEDIN_REDIRECT_URI,
    scope: LINKEDIN_SCOPES,
    state: state || 'ainspiration-linkedin'
  });
  return `https://www.linkedin.com/oauth/v2/authorization?${params}`;
}

/**
 * Exchange authorization code for access token
 */
async function exchangeCode(code) {
  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: LINKEDIN_REDIRECT_URI,
      client_id: LINKEDIN_CLIENT_ID,
      client_secret: LINKEDIN_CLIENT_SECRET
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`LinkedIn token exchange failed: ${err}`);
  }

  return response.json();
}

/**
 * Get LinkedIn user profile
 */
async function getProfile(accessToken) {
  const response = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    throw new Error(`LinkedIn profile fetch failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Store encrypted token in database
 */
async function storeToken(pool, accessToken, expiresIn, scope, subjectId, profileData) {
  const encryptedToken = encrypt(accessToken);
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  await pool.query(`
    INSERT INTO linkedin_tokens (provider, subject_id, encrypted_token, scope, expires_at, profile_data)
    VALUES ('linkedin', $1, $2, $3, $4, $5)
    ON CONFLICT (provider, subject_id)
    DO UPDATE SET encrypted_token = $2, scope = $3, expires_at = $4, profile_data = $5, updated_at = NOW()
  `, [subjectId, encryptedToken, scope, expiresAt, JSON.stringify(profileData)]);

  return { subjectId, expiresAt };
}

/**
 * Get valid (non-expired) token from database
 */
async function getValidToken(pool) {
  const result = await pool.query(`
    SELECT subject_id, encrypted_token, expires_at, profile_data
    FROM linkedin_tokens
    WHERE provider = 'linkedin' AND expires_at > NOW()
    ORDER BY updated_at DESC
    LIMIT 1
  `);

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    accessToken: decrypt(row.encrypted_token),
    subjectId: row.subject_id,
    expiresAt: row.expires_at,
    profileData: row.profile_data
  };
}

/**
 * Publish a text post to LinkedIn using UGC Posts API
 */
async function publishPost(pool, text) {
  const token = await getValidToken(pool);
  if (!token) {
    throw new Error('No valid LinkedIn token. Please reconnect LinkedIn.');
  }

  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token.accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0'
    },
    body: JSON.stringify({
      author: `urn:li:person:${token.subjectId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    })
  });

  if (!response.ok) {
    const err = await response.text();
    if (response.status === 401 || response.status === 403) {
      throw new Error(`LinkedIn auth error (${response.status}): token may be expired`);
    }
    if (response.status === 429) {
      throw new Error('LinkedIn rate limit exceeded. Try again later.');
    }
    throw new Error(`LinkedIn publish failed (${response.status}): ${err}`);
  }

  const postId = response.headers.get('x-restli-id') || response.headers.get('X-RestLi-Id');
  return {
    success: true,
    postId,
    postUrl: postId ? `https://www.linkedin.com/feed/update/${postId}` : null
  };
}

/**
 * Get LinkedIn connection status
 */
async function getConnectionStatus(pool) {
  const token = await getValidToken(pool);
  if (!token) {
    return { connected: false, message: 'No valid token' };
  }

  const daysLeft = Math.ceil((new Date(token.expiresAt) - Date.now()) / (1000 * 60 * 60 * 24));
  return {
    connected: true,
    subjectId: token.subjectId,
    profileData: token.profileData,
    expiresAt: token.expiresAt,
    daysLeft
  };
}

module.exports = {
  getAuthUrl,
  exchangeCode,
  getProfile,
  storeToken,
  getValidToken,
  publishPost,
  getConnectionStatus
};
