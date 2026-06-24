/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
        "./lib/**/*.ts",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: {
                    100: "#F2AD78",
                    200: "#F6EEEC",
                    300: "#FBF7F6",
                },
                accent: {
                    100: "#FBFBFD",
                },
                black: {
                    DEFAULT: "#000000",
                    100: "#373026",
                    200: "#666876",
                    300: "#8C8E98",
                    400: "#888780",
                },
                neutral: {
                    hint: "#B4B2A9",
                    gray: '#EDEBE5'
                },
                form: {
                    error: "#D94F4F",
                },
                danger: "#F75555",
                buttons: {
                    orange: '#ED862F',
                    brown: '#373026',
                },
            }
        },
    },
    plugins: [],
}