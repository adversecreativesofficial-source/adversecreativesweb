
import { defineStackbitConfig } from "@stackbit/types";
import { GitContentSource } from "@stackbit/cms-git";

export default defineStackbitConfig({
  stackbitVersion: "~0.6.0",
  contentSources: [
    new GitContentSource({
      rootPath: __dirname,
      contentDirs: ["src/content"],
      models: [
        {
          name: "Page",
          type: "page",
          urlPath: "/{slug}",
          filePath: "src/content/pages/{slug}.md",
          fields: [
            {
              name: "navbar",
              type: "object",
              fields: [
                { name: "brand", type: "string", required: false },
                { name: "subBrand", type: "string", required: false },
                {
                  name: "contactButton",
                  type: "object",
                  fields: [
                    { name: "text", type: "string", required: false },
                    { name: "link", type: "string", required: false },
                  ],
                },
              ],
            },
            {
              name: "hero",
              type: "object",
              fields: [
                { name: "title", type: "string", required: false },
                { name: "highlight", type: "string", required: false },
                { name: "description", type: "string", required: false },
                {
                  name: "buttons",
                  type: "list",
                  items: {
                    type: "object",
                    fields: [
                      { name: "text", type: "string", required: false },
                      { name: "link", type: "string", required: false },
                      {
                        name: "variant",
                        type: "enum",
                        options: ["primary", "secondary"],
                        required: false,
                      },
                    ],
                  },
                },
                {
                  name: "floatingIcons",
                  type: "list",
                  items: {
                    type: "object",
                    fields: [
                      { name: "icon", type: "string", required: false },
                      { name: "color", type: "string", required: false },
                      { name: "position", type: "string", required: false },
                    ],
                  },
                },
              ],
            },
            {
              name: "stats",
              type: "object",
              fields: [
                { name: "label", type: "string", required: false },
                { name: "title", type: "string", required: false },
                { name: "highlight", type: "string", required: false },
                { name: "description", type: "string", required: false },
                {
                  name: "items",
                  type: "list",
                  items: {
                    type: "object",
                    fields: [
                      { name: "title", type: "string", required: false },
                      { name: "desc", type: "string", required: false },
                      { name: "icon", type: "string", required: false },
                    ],
                  },
                },
              ],
            },
            {
              name: "showcase",
              type: "object",
              fields: [
                { name: "label", type: "string", required: false },
                { name: "title", type: "string", required: false },
                { name: "highlight", type: "string", required: false },
                { name: "description", type: "string", required: false },
                { name: "mainImage", type: "string", required: false }, // Should be image type, but keeping string as per schema z.string for now implies path string
                { name: "videoUrl", type: "string" },
                { name: "rightImage", type: "string" },
                {
                  name: "features",
                  type: "list",
                  items: {
                    type: "object",
                    fields: [
                      { name: "text", type: "string", required: false },
                      { name: "icon", type: "string" },
                    ],
                  },
                },
              ],
            },
            {
              name: "brands",
              type: "object",
              fields: [
                { name: "title", type: "string", required: false },
                { name: "highlight", type: "string", required: false },
                {
                  name: "list",
                  type: "list",
                  items: {
                    type: "object",
                    fields: [
                      { name: "name", type: "string", required: false },
                      { name: "logo", type: "string", required: false },
                      { name: "link", type: "string" },
                    ],
                  },
                },
              ],
            },
            {
              name: "howItWorks",
              type: "object",
              fields: [
                { name: "label", type: "string", required: false },
                { name: "title", type: "string", required: false },
                { name: "image", type: "string", required: false },
                {
                  name: "steps",
                  type: "list",
                  items: {
                    type: "object",
                    fields: [
                      { name: "title", type: "string", required: false },
                      { name: "desc", type: "string", required: false },
                    ],
                  },
                },
              ],
            },
            {
              name: "features",
              type: "object",
              fields: [
                { name: "label", type: "string", required: false },
                { name: "title", type: "string", required: false },
                { name: "highlight", type: "string", required: false },
                { name: "description", type: "string", required: false },
                {
                  name: "items",
                  type: "list",
                  items: {
                    type: "object",
                    fields: [
                      { name: "title", type: "string", required: false },
                      { name: "img", type: "string", required: false },
                      { name: "icon", type: "string", required: false },
                    ],
                  },
                },
              ],
            },
            {
              name: "footer",
              type: "object",
              fields: [
                { name: "companyName", type: "string", required: false },
                { name: "companyDesc", type: "string", required: false },
                {
                  name: "contact",
                  type: "object",
                  fields: [
                    { name: "phone", type: "string", required: false },
                    { name: "email", type: "string", required: false },
                  ],
                },
                {
                  name: "socials",
                  type: "object",
                  fields: [
                    { name: "linkedin", type: "string", required: false },
                    { name: "facebook", type: "string", required: false },
                  ],
                },
                { name: "mapEmbedUrl", type: "string" },
                {
                  name: "contactSection",
                  type: "object",
                  fields: [
                    { name: "title", type: "string", required: false },
                    { name: "highlight", type: "string", required: false },
                    { name: "description", type: "string", required: false },
                    {
                      name: "phones",
                      type: "list",
                      items: {
                        type: "object",
                        fields: [
                          { name: "label", type: "string", required: false },
                          { name: "number", type: "string", required: false },
                        ],
                      },
                    },
                    {
                      name: "emails",
                      type: "list",
                      items: {
                        type: "object",
                        fields: [
                          { name: "label", type: "string", required: false },
                          { name: "address", type: "string", required: false },
                        ],
                      },
                    },
                  ],
                },
                {
                  name: "mapSection",
                  type: "object",
                  fields: [
                    { name: "title", type: "string", required: false },
                    { name: "highlight", type: "string", required: false },
                    { name: "description", type: "string", required: false },
                    {
                      name: "locations",
                      type: "list",
                      items: { type: "string" },
                    },
                  ],
                },
                {
                  name: "callToAction",
                  type: "object",
                  fields: [
                    { name: "title", type: "string", required: false },
                    { name: "subtitle", type: "string", required: false },
                    {
                      name: "ctaButtons",
                      type: "list",
                      items: {
                        type: "object",
                        fields: [
                          { name: "text", type: "string", required: false },
                          { name: "link", type: "string", required: false },
                          {
                            name: "variant",
                            type: "enum",
                            options: ["primary", "secondary"],
                            required: false,
                          },
                        ],
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),
  ],
});
