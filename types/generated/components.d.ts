import type { Schema, Struct } from '@strapi/strapi';

export interface SeoAiSeoOptimization extends Struct.ComponentSchema {
  collectionName: 'components_seo_ai_optimization';
  info: {
    description: 'AI-powered SEO optimization settings';
    displayName: 'AI SEO Optimization';
  };
  attributes: {
    enableAiOptimization: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    geographicFocus: Schema.Attribute.String;
    lastOptimizationRun: Schema.Attribute.DateTime;
    optimizationScore: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    targetKeywords: Schema.Attribute.Text;
  };
}

export interface SeoAnalytics extends Struct.ComponentSchema {
  collectionName: 'components_seo_analytics';
  info: {
    description: 'Web analytics and tracking configurations';
    displayName: 'Analytics Integration';
  };
  attributes: {
    conversionTracking: Schema.Attribute.Component<
      'seo.conversion-event',
      true
    >;
    cookieConsentRequired: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    customDimensions: Schema.Attribute.Component<'seo.custom-dimension', true>;
    enableDemographics: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    enableEnhancedMeasurement: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    excludeFromAnalytics: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    facebookPixelID: Schema.Attribute.String;
    googleAnalyticsID: Schema.Attribute.String;
    googleTagManagerID: Schema.Attribute.String;
    linkedInInsightTag: Schema.Attribute.String;
    microsoftClarityID: Schema.Attribute.String;
    useGTM: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface SeoBreadcrumb extends Struct.ComponentSchema {
  collectionName: 'components_seo_breadcrumb';
  info: {
    description: 'Define breadcrumb navigation links';
    displayName: 'Breadcrumb';
  };
  attributes: {
    position: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SeoConversionEvent extends Struct.ComponentSchema {
  collectionName: 'components_seo_conversion_event';
  info: {
    description: 'Track specific conversion events';
    displayName: 'Conversion Event';
  };
  attributes: {
    customEventProperties: Schema.Attribute.JSON;
    eventCategory: Schema.Attribute.Enumeration<
      [
        'contact',
        'consultation',
        'download',
        'signup',
        'call',
        'video',
        'custom',
      ]
    > &
      Schema.Attribute.Required;
    eventName: Schema.Attribute.String & Schema.Attribute.Required;
    eventValue: Schema.Attribute.Decimal;
    selector: Schema.Attribute.String;
    triggerOn: Schema.Attribute.Enumeration<
      ['click', 'submit', 'scroll', 'view', 'timer']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'click'>;
  };
}

export interface SeoCustomDimension extends Struct.ComponentSchema {
  collectionName: 'components_seo_custom_dimension';
  info: {
    description: 'Custom dimension for GA4';
    displayName: 'Custom Dimension';
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    scope: Schema.Attribute.Enumeration<['event', 'user', 'session', 'page']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'page'>;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SeoGoogleBusiness extends Struct.ComponentSchema {
  collectionName: 'components_seo_google_business';
  info: {
    description: 'Google Business Profile integration settings';
    displayName: 'Google Business Profile';
  };
  attributes: {
    locationName: Schema.Attribute.String;
    profileID: Schema.Attribute.String;
    reviewLink: Schema.Attribute.String;
  };
}

export interface SeoHreflang extends Struct.ComponentSchema {
  collectionName: 'components_seo_hreflang';
  info: {
    description: 'Alternate language version links';
    displayName: 'Hreflang';
  };
  attributes: {
    language: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SeoLegalService extends Struct.ComponentSchema {
  collectionName: 'components_seo_legal_service';
  info: {
    description: 'Schema.org LegalService specific properties';
    displayName: 'Legal Service Schema';
  };
  attributes: {
    areaServed: Schema.Attribute.Text;
    audience: Schema.Attribute.Text;
    availableLanguage: Schema.Attribute.Text;
    hasOfferCatalog: Schema.Attribute.Component<'seo.service-offer', true>;
    provider: Schema.Attribute.Relation<
      'oneToOne',
      'api::staff-member.staff-member'
    >;
    serviceDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    serviceName: Schema.Attribute.String & Schema.Attribute.Required;
    serviceOutput: Schema.Attribute.Text;
    serviceType: Schema.Attribute.Enumeration<
      [
        'FamilyLaw',
        'CriminalLaw',
        'DivorceLaw',
        'BusinessLaw',
        'ImmigrationLaw',
        'PersonalInjuryLaw',
        'EstateAndTrustLaw',
        'RealEstateLaw',
        'BankruptcyLaw',
        'IntellectualPropertyLaw',
        'TaxLaw',
        'OtherLegalService',
      ]
    > &
      Schema.Attribute.Required;
    termsOfService: Schema.Attribute.String;
  };
}

export interface SeoLocalBusiness extends Struct.ComponentSchema {
  collectionName: 'components_seo_local_business';
  info: {
    description: 'Schema.org LocalBusiness data for local SEO';
    displayName: 'Local Business Schema';
  };
  attributes: {
    addressCountry: Schema.Attribute.String & Schema.Attribute.DefaultTo<'US'>;
    addressLocality: Schema.Attribute.String;
    addressRegion: Schema.Attribute.String;
    areaServed: Schema.Attribute.Text;
    businessName: Schema.Attribute.String;
    businessType: Schema.Attribute.Enumeration<
      [
        'LegalService',
        'Attorney',
        'Lawyer',
        'Organization',
        'LocalBusiness',
        'ProfessionalService',
      ]
    > &
      Schema.Attribute.DefaultTo<'LegalService'>;
    email: Schema.Attribute.Email;
    image: Schema.Attribute.Media<'images'>;
    latitude: Schema.Attribute.Decimal;
    logo: Schema.Attribute.Media<'images'>;
    longitude: Schema.Attribute.Decimal;
    openingHours: Schema.Attribute.Component<'seo.opening-hours', true>;
    paymentAccepted: Schema.Attribute.Text;
    postalCode: Schema.Attribute.String;
    priceRange: Schema.Attribute.String;
    sameAs: Schema.Attribute.Text;
    streetAddress: Schema.Attribute.String;
    telephone: Schema.Attribute.String;
    url: Schema.Attribute.String;
  };
}

export interface SeoOpeningHours extends Struct.ComponentSchema {
  collectionName: 'components_seo_opening_hours';
  info: {
    description: 'Business hours specification for LocalBusiness schema';
    displayName: 'Opening Hours';
  };
  attributes: {
    closes: Schema.Attribute.String;
    dayOfWeek: Schema.Attribute.Enumeration<
      [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ]
    > &
      Schema.Attribute.Required;
    isClosed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    opens: Schema.Attribute.String;
  };
}

export interface SeoPageSpeed extends Struct.ComponentSchema {
  collectionName: 'components_seo_page_speed';
  info: {
    description: 'Settings for page speed and Core Web Vitals';
    displayName: 'Page Speed Optimizations';
  };
  attributes: {
    deferNonCriticalCSS: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    deferNonCriticalJS: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    lazyLoadImages: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    preconnect: Schema.Attribute.Text;
    preload: Schema.Attribute.Component<'seo.preload-resource', true>;
    priority: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface SeoPreloadResource extends Struct.ComponentSchema {
  collectionName: 'components_seo_preload_resource';
  info: {
    description: 'Resource to preload for page speed';
    displayName: 'Preload Resource';
  };
  attributes: {
    mediaQuery: Schema.Attribute.String;
    resourceType: Schema.Attribute.Enumeration<
      ['image', 'style', 'script', 'font', 'document']
    > &
      Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SeoSeoMetadata extends Struct.ComponentSchema {
  collectionName: 'components_seo_seo_metadata';
  info: {
    description: 'Comprehensive SEO metadata for content';
    displayName: 'SEO Metadata';
  };
  attributes: {
    advancedRobots: Schema.Attribute.String;
    aiOptimization: Schema.Attribute.Component<
      'seo.ai-seo-optimization',
      false
    >;
    articleModifiedDate: Schema.Attribute.DateTime;
    articlePublishDate: Schema.Attribute.DateTime;
    canonicalURL: Schema.Attribute.String;
    excludeFromSitemap: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    focusKeyword: Schema.Attribute.String;
    googleBusinessProfile: Schema.Attribute.Component<
      'seo.google-business',
      false
    >;
    metaDescription: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    metaKeywords: Schema.Attribute.Text;
    metaRobots: Schema.Attribute.Enumeration<
      [
        'index, follow',
        'index, nofollow',
        'noindex, follow',
        'noindex, nofollow',
      ]
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'index, follow'>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
    metaViewport: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'width=device-width, initial-scale=1'>;
    ogDescription: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    ogImage: Schema.Attribute.Media<'images'>;
    ogLocale: Schema.Attribute.String & Schema.Attribute.DefaultTo<'en_US'>;
    ogTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
    ogType: Schema.Attribute.Enumeration<
      ['website', 'article', 'profile', 'book', 'business.business']
    > &
      Schema.Attribute.DefaultTo<'website'>;
    preventIndexing: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    schemaMarkup: Schema.Attribute.Text;
    socialMediaSharing: Schema.Attribute.Component<'seo.social-sharing', false>;
    structuredData: Schema.Attribute.JSON;
    twitterCard: Schema.Attribute.Enumeration<
      ['summary', 'summary_large_image', 'app', 'player']
    > &
      Schema.Attribute.DefaultTo<'summary_large_image'>;
    twitterCreator: Schema.Attribute.String;
    twitterImage: Schema.Attribute.Media<'images'>;
    twitterSite: Schema.Attribute.String;
  };
}

export interface SeoServiceOffer extends Struct.ComponentSchema {
  collectionName: 'components_seo_service_offer';
  info: {
    description: 'Schema.org Offer for specific service packages';
    displayName: 'Service Offer';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    offerName: Schema.Attribute.String & Schema.Attribute.Required;
    price: Schema.Attribute.Decimal;
    priceCurrency: Schema.Attribute.String & Schema.Attribute.DefaultTo<'USD'>;
    priceSpecification: Schema.Attribute.Text;
    url: Schema.Attribute.String;
    validFrom: Schema.Attribute.DateTime;
    validThrough: Schema.Attribute.DateTime;
  };
}

export interface SeoSocialSharing extends Struct.ComponentSchema {
  collectionName: 'components_seo_social_sharing';
  info: {
    description: 'Settings for social media sharing and integration';
    displayName: 'Social Media Sharing';
  };
  attributes: {
    customShareText: Schema.Attribute.Text;
    enableAutoPosting: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    hashTags: Schema.Attribute.String;
  };
}

export interface StaffEducation extends Struct.ComponentSchema {
  collectionName: 'components_staff_education';
  info: {
    description: 'Educational background for staff members';
    displayName: 'Education';
  };
  attributes: {
    degree: Schema.Attribute.String & Schema.Attribute.Required;
    description: Schema.Attribute.Text;
    institution: Schema.Attribute.String & Schema.Attribute.Required;
    year: Schema.Attribute.String;
  };
}

export interface StaffExperience extends Struct.ComponentSchema {
  collectionName: 'components_staff_experience';
  info: {
    description: 'Work experience for staff members';
    displayName: 'Experience';
  };
  attributes: {
    company: Schema.Attribute.String & Schema.Attribute.Required;
    current: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    description: Schema.Attribute.Text;
    endDate: Schema.Attribute.Date;
    position: Schema.Attribute.String & Schema.Attribute.Required;
    startDate: Schema.Attribute.Date;
  };
}

export interface StaffSocialMedia extends Struct.ComponentSchema {
  collectionName: 'components_staff_social_media';
  info: {
    description: 'Social media profiles for staff members';
    displayName: 'Social Media';
  };
  attributes: {
    avvo: Schema.Attribute.String;
    facebook: Schema.Attribute.String;
    instagram: Schema.Attribute.String;
    justia: Schema.Attribute.String;
    linkedin: Schema.Attribute.String;
    twitter: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'seo.ai-seo-optimization': SeoAiSeoOptimization;
      'seo.analytics': SeoAnalytics;
      'seo.breadcrumb': SeoBreadcrumb;
      'seo.conversion-event': SeoConversionEvent;
      'seo.custom-dimension': SeoCustomDimension;
      'seo.google-business': SeoGoogleBusiness;
      'seo.hreflang': SeoHreflang;
      'seo.legal-service': SeoLegalService;
      'seo.local-business': SeoLocalBusiness;
      'seo.opening-hours': SeoOpeningHours;
      'seo.page-speed': SeoPageSpeed;
      'seo.preload-resource': SeoPreloadResource;
      'seo.seo-metadata': SeoSeoMetadata;
      'seo.service-offer': SeoServiceOffer;
      'seo.social-sharing': SeoSocialSharing;
      'staff.education': StaffEducation;
      'staff.experience': StaffExperience;
      'staff.social-media': StaffSocialMedia;
    }
  }
}
