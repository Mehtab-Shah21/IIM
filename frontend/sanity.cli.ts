/**
 * Sanity CLI config for the frontend: used only for typegen
 * (the Studio has its own config in /studio).
 */
import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'placeholder',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  },
  typegen: {
    path: './lib/sanity/**/*.{ts,tsx}',
    schema: '../sanity.schema.json',
    generates: './sanity.types.ts',
    overloadClientMethods: true,
  },
})
