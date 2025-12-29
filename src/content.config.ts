import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    navbar: z.object({
      brand: z.string(),
      subBrand: z.string(),
      contactButton: z.object({
        text: z.string(),
        link: z.string(),
      }),
    }).optional(),
    hero: z.object({
      title: z.string(),
      highlight: z.string(),
      description: z.string(),
      buttons: z.array(
        z.object({
          text: z.string(),
          link: z.string(),
          variant: z.enum(["primary", "secondary"]),
        })
      ),
      floatingIcons: z
        .array(
          z.object({
            icon: z.string(), // We'll store SVG path or name
            color: z.string(),
            position: z.string(), // 'left' or 'right'
          })
        )
        .optional(),
    }).optional(),
    stats: z.object({
      label: z.string(),
      title: z.string(),
      highlight: z.string(),
      description: z.string(),
      items: z.array(
        z.object({
          title: z.string(),
          desc: z.string(),
          icon: z.string(),
        })
      ),
    }).optional(),
    showcase: z.object({
      label: z.string(),
      title: z.string(),
      highlight: z.string(),
      description: z.string(),
      mainImage: z.string(),
      videoUrl: z.string().optional(),
      rightImage: z.string().optional(),
      features: z.array(
        z.object({
          text: z.string(),
          icon: z.string().optional(),
        })
      ),
    }).optional(),
    brands: z.object({
      title: z.string(),
      highlight: z.string(),
      list: z.array(
        z.object({
          name: z.string(),
          logo: z.string(),
          link: z.string().optional(),
        })
      ),
    }).optional(),
    howItWorks: z.object({
      label: z.string(),
      title: z.string(),
      image: z.string(),
      steps: z.array(
        z.object({
          title: z.string(),
          desc: z.string(),
        })
      ),
    }).optional(),
    features: z.object({
      label: z.string(),
      title: z.string(),
      highlight: z.string(),
      description: z.string(),
      items: z.array(
        z.object({
          title: z.string(),
          img: z.string(),
          icon: z.string(),
        })
      ),
    }).optional(),
    footer: z.object({
      companyName: z.string(),
      companyDesc: z.string(),
      contact: z.object({
        phone: z.string(),
        email: z.string(),
      }),
      socials: z
        .object({
          linkedin: z.string(),
          facebook: z.string(),
        })
        .optional(),
      mapEmbedUrl: z.string().optional(),
    }).optional(),
    callToAction: z.object({
      title: z.string(),
      subtitle: z.string(),
      ctaButtons: z
        .array(
          z.object({
            text: z.string(),
            link: z.string(),
            variant: z.enum(["primary", "secondary"]),
          })
        )
        .optional(),
    }).optional(),
    contactSection: z
      .object({
        title: z.string(),
        highlight: z.string(),
        description: z.string(),
        phones: z.array(
          z.object({
            label: z.string(),
            number: z.string(),
          })
        ),
        emails: z.array(
          z.object({
            label: z.string(),
            address: z.string(),
          })
        ),
      })
      .optional(),
    mapSection: z
      .object({
        title: z.string(),
        highlight: z.string(),
        description: z.string(),
        locations: z.array(z.string()),
      })
      .optional(),
  }),
});

export const collections = { pages };
