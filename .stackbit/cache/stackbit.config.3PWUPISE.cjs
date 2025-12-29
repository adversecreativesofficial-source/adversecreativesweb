"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// stackbit.config.ts
var stackbit_config_exports = {};
__export(stackbit_config_exports, {
  default: () => stackbit_config_default
});
module.exports = __toCommonJS(stackbit_config_exports);
var import_types = require("@stackbit/types");
var import_cms_git = require("@stackbit/cms-git");
var stackbit_config_default = (0, import_types.defineStackbitConfig)({
  stackbitVersion: "~0.6.0",
  contentSources: [
    new import_cms_git.GitContentSource({
      rootPath: "/Users/adx/Develop/Repos/adversecreativesweb",
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
                { name: "brand", type: "string", required: true },
                { name: "subBrand", type: "string", required: true },
                {
                  name: "contactButton",
                  type: "object",
                  fields: [
                    { name: "text", type: "string", required: true },
                    { name: "link", type: "string", required: true }
                  ]
                }
              ]
            },
            {
              name: "hero",
              type: "object",
              fields: [
                { name: "title", type: "string", required: true },
                { name: "highlight", type: "string", required: true },
                { name: "description", type: "string", required: true },
                {
                  name: "buttons",
                  type: "list",
                  items: {
                    type: "object",
                    fields: [
                      { name: "text", type: "string", required: true },
                      { name: "link", type: "string", required: true },
                      {
                        name: "variant",
                        type: "enum",
                        options: ["primary", "secondary"],
                        required: true
                      }
                    ]
                  }
                },
                {
                  name: "floatingIcons",
                  type: "list",
                  items: {
                    type: "object",
                    fields: [
                      { name: "icon", type: "string", required: true },
                      { name: "color", type: "string", required: true },
                      { name: "position", type: "string", required: true }
                    ]
                  }
                }
              ]
            },
            {
              name: "stats",
              type: "object",
              fields: [
                { name: "label", type: "string", required: true },
                { name: "title", type: "string", required: true },
                { name: "highlight", type: "string", required: true },
                { name: "description", type: "string", required: true },
                {
                  name: "items",
                  type: "list",
                  items: {
                    type: "object",
                    fields: [
                      { name: "title", type: "string", required: true },
                      { name: "desc", type: "string", required: true },
                      { name: "icon", type: "string", required: true }
                    ]
                  }
                }
              ]
            },
            {
              name: "showcase",
              type: "object",
              fields: [
                { name: "label", type: "string", required: true },
                { name: "title", type: "string", required: true },
                { name: "highlight", type: "string", required: true },
                { name: "description", type: "string", required: true },
                { name: "mainImage", type: "string", required: true },
                // Should be image type, but keeping string as per schema z.string for now implies path string
                { name: "videoUrl", type: "string" },
                { name: "rightImage", type: "string" },
                {
                  name: "features",
                  type: "list",
                  items: {
                    type: "object",
                    fields: [
                      { name: "text", type: "string", required: true },
                      { name: "icon", type: "string" }
                    ]
                  }
                }
              ]
            },
            {
              name: "brands",
              type: "object",
              fields: [
                { name: "title", type: "string", required: true },
                { name: "highlight", type: "string", required: true },
                {
                  name: "list",
                  type: "list",
                  items: {
                    type: "object",
                    fields: [
                      { name: "name", type: "string", required: true },
                      { name: "logo", type: "string", required: true },
                      { name: "link", type: "string" }
                    ]
                  }
                }
              ]
            },
            {
              name: "howItWorks",
              type: "object",
              fields: [
                { name: "label", type: "string", required: true },
                { name: "title", type: "string", required: true },
                { name: "image", type: "string", required: true },
                {
                  name: "steps",
                  type: "list",
                  items: {
                    type: "object",
                    fields: [
                      { name: "title", type: "string", required: true },
                      { name: "desc", type: "string", required: true }
                    ]
                  }
                }
              ]
            },
            {
              name: "features",
              type: "object",
              fields: [
                { name: "label", type: "string", required: true },
                { name: "title", type: "string", required: true },
                { name: "highlight", type: "string", required: true },
                { name: "description", type: "string", required: true },
                {
                  name: "items",
                  type: "list",
                  items: {
                    type: "object",
                    fields: [
                      { name: "title", type: "string", required: true },
                      { name: "img", type: "string", required: true },
                      { name: "icon", type: "string", required: true }
                    ]
                  }
                }
              ]
            },
            {
              name: "footer",
              type: "object",
              fields: [
                { name: "title", type: "string", required: true },
                { name: "subtitle", type: "string", required: true },
                { name: "companyName", type: "string", required: true },
                { name: "companyDesc", type: "string", required: true },
                {
                  name: "contact",
                  type: "object",
                  fields: [
                    { name: "phone", type: "string", required: true },
                    { name: "email", type: "string", required: true }
                  ]
                },
                {
                  name: "ctaButtons",
                  type: "list",
                  items: {
                    type: "object",
                    fields: [
                      { name: "text", type: "string", required: true },
                      { name: "link", type: "string", required: true },
                      {
                        name: "variant",
                        type: "enum",
                        options: ["primary", "secondary"],
                        required: true
                      }
                    ]
                  }
                },
                {
                  name: "socials",
                  type: "object",
                  fields: [
                    { name: "linkedin", type: "string", required: true },
                    { name: "facebook", type: "string", required: true }
                  ]
                },
                { name: "mapEmbedUrl", type: "string" }
              ]
            }
          ]
        }
      ]
    })
  ]
});
//# sourceMappingURL=stackbit.config.3PWUPISE.cjs.map
