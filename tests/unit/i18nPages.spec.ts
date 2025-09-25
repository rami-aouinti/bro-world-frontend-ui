import { describe, expect, it } from 'vitest'

import ar from '~/i18n/locales/ar.json'
import de from '~/i18n/locales/de.json'
import en from '~/i18n/locales/en.json'
import fr from '~/i18n/locales/fr.json'

const locales = { en, fr, de, ar } as const

const requiredKeys = [
  'pages.about.title',
  'pages.about.subtitle',
  'pages.about.missionTitle',
  'pages.about.missionBody',
  'pages.about.missionPoints.builders.title',
  'pages.about.missionPoints.builders.body',
  'pages.about.missionPoints.community.title',
  'pages.about.missionPoints.community.body',
  'pages.about.missionPoints.iteration.title',
  'pages.about.missionPoints.iteration.body',
  'pages.about.teamTitle',
  'pages.about.teamBody',
  'pages.about.teamMembers.amina.role',
  'pages.about.teamMembers.amina.bio',
  'pages.about.teamMembers.lukas.role',
  'pages.about.teamMembers.lukas.bio',
  'pages.about.teamMembers.clara.role',
  'pages.about.teamMembers.clara.bio',
  'pages.about.teamMembers.youssef.role',
  'pages.about.teamMembers.youssef.bio',
  'pages.about.techTitle',
  'pages.about.techBody',
  'pages.about.techStack.nuxt',
  'pages.about.techStack.vuetify',
  'pages.about.techStack.typescript',
  'pages.about.techStack.vitest',
  'pages.about.timelineTitle',
  'pages.about.timeline.2023.title',
  'pages.about.timeline.2023.description',
  'pages.about.timeline.2024.title',
  'pages.about.timeline.2024.description',
  'pages.about.timeline.2025.title',
  'pages.about.timeline.2025.description',
  'pages.about.linksTitle',
  'pages.about.links.github',
  'pages.about.links.docs',
  'pages.about.links.community',
  'pages.about.links.githubAria',
  'pages.about.links.docsAria',
  'pages.about.links.communityAria',
  'pages.help.title',
  'pages.help.subtitle',
  'pages.help.faqTitle',
  'pages.help.searchPlaceholder',
  'pages.help.quickLinksTitle',
  'pages.help.faqCountSingular',
  'pages.help.faqCountPlural',
  'pages.help.faqEmpty',
  'pages.help.actions.reportBug',
  'pages.help.actions.reportBugDescription',
  'pages.help.actions.reportBugCta',
  'pages.help.actions.reportBugAria',
  'pages.help.actions.accountPrivacy',
  'pages.help.actions.accountPrivacyDescription',
  'pages.help.actions.accountPrivacyCta',
  'pages.help.actions.accountPrivacyAria',
  'pages.help.actions.contactSupport',
  'pages.help.actions.contactSupportDescription',
  'pages.help.actions.contactSupportCta',
  'pages.help.actions.contactSupportAria',
  'pages.help.faq.items.gettingStarted.question',
  'pages.help.faq.items.gettingStarted.answer',
  'pages.help.faq.items.gettingStarted.link',
  'pages.help.faq.items.localization.question',
  'pages.help.faq.items.localization.answer',
  'pages.help.faq.items.components.question',
  'pages.help.faq.items.components.answer',
  'pages.help.faq.items.components.link',
  'pages.help.faq.items.contributing.question',
  'pages.help.faq.items.contributing.answer',
  'pages.help.faq.items.contributing.link',
  'pages.help.faq.items.privacy.question',
  'pages.help.faq.items.privacy.answer',
  'pages.contact.title',
  'pages.contact.subtitle',
  'pages.contact.form.name',
  'pages.contact.form.email',
  'pages.contact.form.subject',
  'pages.contact.form.message',
  'pages.contact.form.submit',
  'pages.contact.form.sending',
  'pages.contact.form.success',
  'pages.contact.form.error',
  'pages.contact.validation.required',
  'pages.contact.validation.email',
  'pages.contact.validation.minMessage',
  'pages.contact.details.title',
  'pages.contact.details.description',
  'pages.contact.details.email',
  'pages.contact.details.emailDescription',
  'pages.contact.details.emailCta',
  'pages.contact.details.emailCtaLabel',
  'pages.contact.details.community',
  'pages.contact.details.communityDescription',
  'pages.contact.details.communityCta',
  'pages.contact.details.communityCtaLabel',
  'pages.contact.details.docs',
  'pages.contact.details.docsDescription',
  'pages.contact.details.docsCta',
  'pages.contact.details.docsCtaLabel',
  'pages.contact.availability.title',
  'pages.contact.availability.body',
  'seo.about.title',
  'seo.about.description',
  'seo.help.title',
  'seo.help.description',
  'seo.contact.title',
  'seo.contact.description',
] as const

function getValue(message: Record<string, any>, path: string) {
  return path.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), message)
}

describe('page translations', () => {
  for (const [code, messages] of Object.entries(locales)) {
    describe(code, () => {
      for (const key of requiredKeys) {
        it(`includes translation for ${key}`, () => {
          const value = getValue(messages as Record<string, any>, key)
          expect(value, `Missing key ${key} for locale ${code}`).toBeTruthy()
        })
      }
    })
  }
})
