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
                    500: "#5F5E5A",
                },
                ink: {
                    DEFAULT: "#1C1B19",
                    25: "#1C1B1940",
                    40: "#1C1B1966",
                    50: "#1C1B1980",
                    60: "#1C1B1999",
                },
                white: "#FFFFFF",
                neutral: {
                    hint: "#B4B2A9",
                    gray: '#EDEBE5',
                    label: '#A09890',
                    body: '#6B6560',
                    divider: '#F0EBE5',
                    border: '#E6E0D8',
                    tinted: '#E0DDD7',
                    softTint: '#f7f4f1',
                },
                surface: {
                    sheet: '#F2EDE8',
                    orangeLight: '#FEF3EA',
                    greenLight: '#E8F4EE',
                    blueLight: '#E6F1FB',
                },
                activity: {
                    orange: '#E8642A',
                    orangeDark: '#D4650E',
                    green: '#2D8B5A',
                    blue: '#185FA5',
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