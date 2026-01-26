import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class', // 👈 必须加这一行
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"LINE Seed JP"',       
          '"PingFang SC"',        
          '"Hiragino Sans GB"',   
          '"Microsoft YaHei"',  
          '"Segoe UI"',    
          'sans-serif' 
        ],
      },
    },
  },
  plugins: [],
};
export default config;