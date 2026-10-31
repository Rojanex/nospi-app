/** @type {import('tailwindcss').Config} */
const { Colors } = require('./assets/constants/Colors.ts')

module.exports = {
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
        "./lib/**/*.ts",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            // Keep in sync with constants/typography.ts
            fontSize: {
                micro: ["11px", { lineHeight: "14px" }],
                label: ["12px", { lineHeight: "16px" }],
                caption: ["13px", { lineHeight: "18px" }],
                body: ["15px", { lineHeight: "21px" }],
                lead: ["17px", { lineHeight: "23px" }],
                title: ["19px", { lineHeight: "25px" }],
            },
            // Colors come from assets/constants/Colors.ts (single source of truth)
            colors: Colors,
        },
    },
    plugins: [],
}