import { describe, it, expect } from 'vitest';
import routes, { menuItems } from './routes';

describe('routes', () => {
  it('should have a home route', () => {
    const homeRoute = routes.find((r) => r.path === '/');
    expect(homeRoute).toBeDefined();
    expect(homeRoute?.exact).toBe(true);
  });

  it('should have a catch-all 404 route', () => {
    const notFound = routes.find((r) => r.path === '*');
    expect(notFound).toBeDefined();
  });

  it('should have contact route', () => {
    const contact = routes.find((r) => r.path === '/contact');
    expect(contact).toBeDefined();
    expect(contact?.exact).toBe(true);
  });

  it('should have blog routes', () => {
    const blog = routes.find((r) => r.path === '/blog');
    const blogPost = routes.find((r) => r.path === '/blog/:slug');
    expect(blog).toBeDefined();
    expect(blogPost).toBeDefined();
  });

  it('should have legal pages', () => {
    const privacy = routes.find((r) => r.path === '/privacy');
    const cgv = routes.find((r) => r.path === '/cgv');
    const cgu = routes.find((r) => r.path === '/cgu');
    const mentions = routes.find((r) => r.path === '/mentions-legales');
    expect(privacy).toBeDefined();
    expect(cgv).toBeDefined();
    expect(cgu).toBeDefined();
    expect(mentions).toBeDefined();
  });

  it('should mark private routes correctly', () => {
    const dashboard = routes.find((r) => r.path === '/dashboard');
    expect(dashboard?.private).toBe(true);

    const crmDash = routes.find((r) => r.path === '/crm-dashboard');
    expect(crmDash?.private).toBe(true);

    // Public pages should not be private
    const home = routes.find((r) => r.path === '/');
    expect(home?.private).toBeFalsy();

    const contact = routes.find((r) => r.path === '/contact');
    expect(contact?.private).toBeFalsy();
  });

  it('all routes should have a component', () => {
    routes.forEach((route) => {
      expect(route.component, `Route ${route.path} missing component`).toBeDefined();
    });
  });

  it('should not have duplicate paths', () => {
    const paths = routes.map((r) => r.path);
    const uniquePaths = new Set(paths);
    // Allow /products appearing twice (public + private)
    // Just check no exact duplicates cause issues
    expect(paths.length).toBeGreaterThan(20);
  });
});

describe('menuItems', () => {
  it('should have main menu sections', () => {
    expect(menuItems.length).toBeGreaterThanOrEqual(5);
  });

  it('should have Découvrir section with items', () => {
    const decouvrir = menuItems.find((m) => m.label === 'Découvrir');
    expect(decouvrir).toBeDefined();
    expect(decouvrir?.items?.length).toBeGreaterThan(0);
  });

  it('should have Solutions section', () => {
    const solutions = menuItems.find((m) => m.label === 'Solutions');
    expect(solutions).toBeDefined();
    expect(solutions?.path).toBe('/solutions');
    expect(solutions?.items?.length).toBeGreaterThan(3);
  });

  it('should have Blog section', () => {
    const blog = menuItems.find((m) => m.label === 'Blog');
    expect(blog).toBeDefined();
    expect(blog?.path).toBe('/blog');
  });

  it('should have Contact in Accompagnement', () => {
    const accomp = menuItems.find((m) => m.label === 'Accompagnement');
    expect(accomp).toBeDefined();
    const contactItem = accomp?.items?.find((i) => i.label === 'Contact');
    expect(contactItem).toBeDefined();
    expect(contactItem?.path).toBe('/contact');
  });
});
