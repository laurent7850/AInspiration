import React, { useState } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  User,
  Briefcase,
  Users,
  Clock,
  Wrench,
  MessageSquare,
  CheckCircle,
  Loader2,
  Send
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { isValidEmail, isValidPhone, checkRateLimit } from '../utils/validation';

// Webhook n8n direct pour le pipeline audit
const AUDIT_WEBHOOK_URL = "https://n8n.srv767464.hstgr.cloud/webhook/C8SIVfn0ELbrXDzy/webhook/audit-ia";

interface AuditFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AuditFormData {
  // Étape 1 — Coordonnées
  name: string;
  email: string;
  phone: string;
  company: string;
  // Étape 2 — Votre activité
  sector: string;
  sectorOther: string;
  teamSize: string;
  role: string;
  // Étape 3 — Vos besoins
  processes: string[];
  processesOther: string;
  currentTools: string;
  weeklyHoursWasted: string;
  // Étape 4 — Contexte
  aiExperience: string;
  budget: string;
  priority: string;
  additionalInfo: string;
}

const SECTOR_KEYS = [
  'comptabilite', 'juridique', 'immobilier', 'medical', 'restaurant',
  'commerce', 'ecommerce', 'agence', 'consulting', 'artisan', 'industrie', 'other'
];

const TEAM_SIZE_KEYS = ['1', '2-5', '6-20', '21-50', '50+'];

const PROCESS_KEYS = [
  'facturation', 'email', 'prospection', 'planning', 'reporting',
  'rh', 'stock', 'social', 'support', 'comptabilite', 'other'
];

const WEEKLY_HOURS_KEYS = ['1-5', '5-10', '10-20', '20+', 'unknown'];

const AI_EXPERIENCE_KEYS = ['none', 'basic', 'moderate', 'advanced'];

const BUDGET_KEYS = ['discovery', 'starter', 'growth', 'enterprise'];

export default function AuditForm({ isOpen, onClose }: AuditFormProps) {
  const { t } = useTranslation('audit');
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<AuditFormData>({
    name: '', email: '', phone: '', company: '',
    sector: '', sectorOther: '', teamSize: '', role: '',
    processes: [], processesOther: '', currentTools: '', weeklyHoursWasted: '',
    aiExperience: '', budget: '', priority: '', additionalInfo: ''
  });

  if (!isOpen) return null;

  const updateField = (field: keyof AuditFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const toggleProcess = (value: string) => {
    setFormData(prev => ({
      ...prev,
      processes: prev.processes.includes(value)
        ? prev.processes.filter(p => p !== value)
        : [...prev.processes, value]
    }));
  };

  const validateStep = (s: number): boolean => {
    const errors: Record<string, string> = {};

    if (s === 1) {
      if (!formData.name.trim()) errors.name = t('form.errors.nameRequired');
      if (!formData.email.trim()) errors.email = t('form.errors.emailRequired');
      else if (!isValidEmail(formData.email)) errors.email = t('form.errors.emailInvalid');
      if (!formData.company.trim()) errors.company = t('form.errors.companyRequired');
    }

    if (s === 2) {
      if (!formData.sector) errors.sector = t('form.errors.sectorRequired');
      if (formData.sector === 'other' && !formData.sectorOther.trim()) errors.sectorOther = t('form.errors.sectorOtherRequired');
      if (!formData.teamSize) errors.teamSize = t('form.errors.teamSizeRequired');
    }

    if (s === 3) {
      if (formData.processes.length === 0) errors.processes = t('form.errors.processesRequired');
      if (!formData.weeklyHoursWasted) errors.weeklyHoursWasted = t('form.errors.weeklyHoursRequired');
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    if (!checkRateLimit('auditform', 2, 300000)) {
      setError(t('form.errors.rateLimit'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const sectorLabel = formData.sector === 'other'
        ? formData.sectorOther
        : t(`sectors.${formData.sector}`);

      const processLabels = formData.processes.map(p => {
        if (p === 'other') return formData.processesOther || t('processes.other');
        return t(`processes.${p}`);
      });

      const teamSizeLabel = t(`teamSizes.${formData.teamSize}`);
      const hoursLabel = t(`weeklyHours.${formData.weeklyHoursWasted}`);
      const aiLabel = formData.aiExperience ? t(`aiExperience.${formData.aiExperience}`) : t('structuredMessage.notSpecified');
      const budgetLabel = formData.budget ? t(`budgets.${formData.budget}`) : t('structuredMessage.notSpecified');

      const sm = t;
      const structuredMessage = [
        sm('structuredMessage.title'),
        '',
        `--- ${sm('structuredMessage.coordinates')} ---`,
        `${sm('structuredMessage.name')} : ${formData.name}`,
        `${sm('structuredMessage.company')} : ${formData.company}`,
        `${sm('structuredMessage.email')} : ${formData.email}`,
        formData.phone ? `${sm('structuredMessage.phone')} : ${formData.phone}` : null,
        formData.role ? `${sm('structuredMessage.role')} : ${formData.role}` : null,
        '',
        `--- ${sm('structuredMessage.activity')} ---`,
        `${sm('structuredMessage.sector')} : ${sectorLabel}`,
        `${sm('structuredMessage.teamSize')} : ${teamSizeLabel}`,
        '',
        `--- ${sm('structuredMessage.needs')} ---`,
        `${sm('structuredMessage.processes')} : ${processLabels.join(', ')}`,
        `${sm('structuredMessage.weeklyHours')} : ${hoursLabel}`,
        formData.currentTools ? `${sm('structuredMessage.currentTools')} : ${formData.currentTools}` : null,
        '',
        `--- ${sm('structuredMessage.context')} ---`,
        `${sm('structuredMessage.aiExperience')} : ${aiLabel}`,
        `${sm('structuredMessage.budget')} : ${budgetLabel}`,
        formData.priority ? `${sm('structuredMessage.priority')} : ${formData.priority}` : null,
        formData.additionalInfo ? `${sm('structuredMessage.additionalInfo')} : ${formData.additionalInfo}` : null
      ].filter(Boolean).join('\n');

      const webhookData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        company: formData.company,
        sector: sectorLabel,
        teamSize: formData.teamSize,
        role: formData.role || '',
        processes: processLabels,
        currentTools: formData.currentTools || '',
        weeklyHoursWasted: formData.weeklyHoursWasted,
        aiExperience: formData.aiExperience || '',
        budget: formData.budget || '',
        priority: formData.priority || '',
        additionalInfo: formData.additionalInfo || '',
        message: structuredMessage,
        timestamp: new Date().toISOString(),
        source: 'audit_form',
        productId: 'audit-ia'
      };

      const response = await fetch(AUDIT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData)
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(t('form.errors.generic'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setIsSubmitted(false);
      setError(null);
      setFieldErrors({});
      setFormData({
        name: '', email: '', phone: '', company: '',
        sector: '', sectorOther: '', teamSize: '', role: '',
        processes: [], processesOther: '', currentTools: '', weeklyHoursWasted: '',
        aiExperience: '', budget: '', priority: '', additionalInfo: ''
      });
    }, 300);
  };

  const FieldError = ({ field }: { field: string }) => (
    fieldErrors[field] ? <p className="text-red-500 text-sm mt-1">{fieldErrors[field]}</p> : null
  );

  const inputClass = (field: string) =>
    `w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${
      fieldErrors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`;

  const radioClass = (selected: boolean) =>
    `flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
      selected
        ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
        : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
    }`;

  const checkboxClass = (selected: boolean) =>
    `flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
      selected
        ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
        : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
    }`;

  // Écran de succès
  if (isSubmitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {t('form.success.title')}
          </h2>
          <p className="text-gray-600 mb-2">
            {t('form.success.analyzing')}
          </p>
          <p className="text-gray-600 mb-6">{t('form.success.report')}</p>
          <div className="bg-indigo-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-indigo-700">
              <strong>{t('form.success.nextTitle')}</strong>
            </p>
            <ol className="text-sm text-indigo-600 mt-2 space-y-1 list-decimal list-inside">
              <li>{t('form.success.nextStep1')}</li>
              <li>{t('form.success.nextStep2')}</li>
              <li>{t('form.success.nextStep3')}</li>
            </ol>
          </div>
          <button
            onClick={handleClose}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            {t('form.close')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t('form.title')}</h2>
              <p className="text-sm text-gray-500">{t('form.stepOf', { step, total: totalSteps })}</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="px-6 py-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* ÉTAPE 1 — Coordonnées */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{t('form.step1.title')}</h3>
                  <p className="text-sm text-gray-500">{t('form.step1.subtitle')}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.step1.name')} {t('form.required')}</label>
                <input type="text" className={inputClass('name')} placeholder={t('form.step1.namePlaceholder')} value={formData.name} onChange={e => updateField('name', e.target.value)} />
                <FieldError field="name" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.step1.email')} {t('form.required')}</label>
                <input type="email" className={inputClass('email')} placeholder={t('form.step1.emailPlaceholder')} value={formData.email} onChange={e => updateField('email', e.target.value)} />
                <FieldError field="email" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.step1.company')} {t('form.required')}</label>
                <input type="text" className={inputClass('company')} placeholder={t('form.step1.companyPlaceholder')} value={formData.company} onChange={e => updateField('company', e.target.value)} />
                <FieldError field="company" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.step1.phone')}</label>
                <input type="tel" className={inputClass('phone')} placeholder={t('form.step1.phonePlaceholder')} value={formData.phone} onChange={e => updateField('phone', e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.step1.role')}</label>
                <input type="text" className={inputClass('role')} placeholder={t('form.step1.rolePlaceholder')} value={formData.role} onChange={e => updateField('role', e.target.value)} />
              </div>
            </div>
          )}

          {/* ÉTAPE 2 — Votre activité */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{t('form.step2.title')}</h3>
                  <p className="text-sm text-gray-500">{t('form.step2.subtitle')}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('form.step2.sectorLabel')} {t('form.required')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {SECTOR_KEYS.map(key => (
                    <div key={key} className={radioClass(formData.sector === key)} onClick={() => updateField('sector', key)}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${formData.sector === key ? 'border-indigo-500' : 'border-gray-300'}`}>
                        {formData.sector === key && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                      </div>
                      <span className="text-sm">{t(`sectors.${key}`)}</span>
                    </div>
                  ))}
                </div>
                <FieldError field="sector" />
              </div>

              {formData.sector === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.step2.sectorOtherLabel')} {t('form.required')}</label>
                  <input type="text" className={inputClass('sectorOther')} placeholder={t('form.step2.sectorOtherPlaceholder')} value={formData.sectorOther} onChange={e => updateField('sectorOther', e.target.value)} />
                  <FieldError field="sectorOther" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('form.step2.teamSizeLabel')} {t('form.required')}</label>
                <div className="space-y-2">
                  {TEAM_SIZE_KEYS.map(key => (
                    <div key={key} className={radioClass(formData.teamSize === key)} onClick={() => updateField('teamSize', key)}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${formData.teamSize === key ? 'border-indigo-500' : 'border-gray-300'}`}>
                        {formData.teamSize === key && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                      </div>
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{t(`teamSizes.${key}`)}</span>
                    </div>
                  ))}
                </div>
                <FieldError field="teamSize" />
              </div>
            </div>
          )}

          {/* ÉTAPE 3 — Vos besoins */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{t('form.step3.title')}</h3>
                  <p className="text-sm text-gray-500">{t('form.step3.subtitle')}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('form.step3.processesLabel')} {t('form.required')} <span className="text-gray-400 font-normal">{t('form.multipleChoice')}</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PROCESS_KEYS.map(key => (
                    <div key={key} className={checkboxClass(formData.processes.includes(key))} onClick={() => toggleProcess(key)}>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${formData.processes.includes(key) ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'}`}>
                        {formData.processes.includes(key) && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm">{t(`processes.${key}`)}</span>
                    </div>
                  ))}
                </div>
                <FieldError field="processes" />
              </div>

              {formData.processes.includes('other') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.step3.processesOtherLabel')}</label>
                  <input type="text" className={inputClass('processesOther')} placeholder={t('form.step3.processesOtherPlaceholder')} value={formData.processesOther} onChange={e => updateField('processesOther', e.target.value)} />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('form.step3.weeklyHoursLabel')} {t('form.required')}</label>
                <div className="space-y-2">
                  {WEEKLY_HOURS_KEYS.map(key => (
                    <div key={key} className={radioClass(formData.weeklyHoursWasted === key)} onClick={() => updateField('weeklyHoursWasted', key)}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${formData.weeklyHoursWasted === key ? 'border-indigo-500' : 'border-gray-300'}`}>
                        {formData.weeklyHoursWasted === key && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                      </div>
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{t(`weeklyHours.${key}`)}</span>
                    </div>
                  ))}
                </div>
                <FieldError field="weeklyHoursWasted" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.step3.currentToolsLabel')}</label>
                <input type="text" className={inputClass('currentTools')} placeholder={t('form.step3.currentToolsPlaceholder')} value={formData.currentTools} onChange={e => updateField('currentTools', e.target.value)} />
              </div>
            </div>
          )}

          {/* ÉTAPE 4 — Contexte & priorité */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{t('form.step4.title')}</h3>
                  <p className="text-sm text-gray-500">{t('form.step4.subtitle')}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('form.step4.aiExperienceLabel')}</label>
                <div className="space-y-2">
                  {AI_EXPERIENCE_KEYS.map(key => (
                    <div key={key} className={radioClass(formData.aiExperience === key)} onClick={() => updateField('aiExperience', key)}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${formData.aiExperience === key ? 'border-indigo-500' : 'border-gray-300'}`}>
                        {formData.aiExperience === key && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                      </div>
                      <span className="text-sm">{t(`aiExperience.${key}`)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('form.step4.budgetLabel')}</label>
                <div className="space-y-2">
                  {BUDGET_KEYS.map(key => (
                    <div key={key} className={radioClass(formData.budget === key)} onClick={() => updateField('budget', key)}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${formData.budget === key ? 'border-indigo-500' : 'border-gray-300'}`}>
                        {formData.budget === key && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                      </div>
                      <span className="text-sm">{t(`budgets.${key}`)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.step4.priorityLabel')}</label>
                <input type="text" className={inputClass('priority')} placeholder={t('form.step4.priorityPlaceholder')} value={formData.priority} onChange={e => updateField('priority', e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.step4.additionalInfoLabel')}</label>
                <textarea className={`${inputClass('additionalInfo')} min-h-[80px] resize-y`} placeholder={t('form.step4.additionalInfoPlaceholder')} value={formData.additionalInfo} onChange={e => updateField('additionalInfo', e.target.value)} rows={3} />
              </div>
            </div>
          )}
        </div>

        {/* Footer — Navigation */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 rounded-b-2xl flex items-center justify-between">
          <div>
            {step > 1 && (
              <button onClick={prevStep} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium">
                <ArrowLeft className="w-4 h-4" />
                {t('form.back')}
              </button>
            )}
          </div>

          <div>
            {step < totalSteps ? (
              <button onClick={nextStep} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2">
                {t('form.continue')}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={isSubmitting} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('form.submitting')}
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {t('form.submit')}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
