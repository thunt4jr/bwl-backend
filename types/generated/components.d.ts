import type { Schema, Struct } from '@strapi/strapi';

export interface SeoSeoMetadata extends Struct.ComponentSchema {
  collectionName: 'components_seo_seo_metadata';
  info: {
    description: 'Manage SEO metadata for content';
    displayName: 'SEO Metadata';
  };
  attributes: {
    canonicalURL: Schema.Attribute.String;
    metaDescription: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    metaKeywords: Schema.Attribute.Text;
    metaRobots: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'index, follow'>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
    metaViewport: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'width=device-width, initial-scale=1'>;
    structuredData: Schema.Attribute.JSON;
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
      'seo.seo-metadata': SeoSeoMetadata;
      'staff.education': StaffEducation;
      'staff.experience': StaffExperience;
      'staff.social-media': StaffSocialMedia;
    }
  }
}
