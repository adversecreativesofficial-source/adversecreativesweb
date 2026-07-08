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
      // Multiple videos auto-rotate (carousel) in the showcase display. Add as
      // many hosted video URLs (mp4/webm) as you like; they cross-fade on a
      // timer. Falls back to `videoUrl`, then `mainImage`, when empty.
      videos: z.array(z.string()).optional(),
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
    faq: z.object({
      title: z.string(),
      items: z.array(
        z.object({
          question: z.string(),
          answer: z.string(),
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
          instagram: z.string(),
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
        label: z.string().optional(),
        title: z.string(),
        highlight: z.string(),
        description: z.string(),
        stats: z.array(
           z.object({
             value: z.string(),
             label: z.string(),
             subLabel: z.string().optional(),
           })
        ).optional(),
        franchises: z
          .array(
            z.object({
              id: z.string(),
              name: z.string(),
              status: z.enum(["active", "coming_soon"]),
              order: z.number().optional(),
              tagline: z.string().optional(),
            })
          )
          .optional(),
        locations: z.array(
          z.object({
            area: z.string(),
            city: z.string(),
            venue: z.string(),
            footfall: z.string(),
            link: z.string(),
            // Matches a franchise `id` in the `franchises` array above. Kept as a
            // free string (not an enum) so new franchises can be added without
            // touching this schema.
            franchise: z.string().optional(),
            image: z.string().optional(),
          })
        ),
      })
      .optional(),
  }),
});

export const collections = { pages };
