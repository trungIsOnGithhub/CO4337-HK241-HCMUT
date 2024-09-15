/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}","./public/index.html"],
  theme: {
    fontFamily:{
      main: [ "Poppins", "sans-serif"]
    },
    extend: {
      gridTemplateRows: {
        '10': 'repeat(10, minmax(0, 1fr))',
      },
      width:{
        main: '1220px'
      },
      backgroundColor:{
        main: '#ee3131',
        overlay: 'rgba(0,0,0,0.7)'
      },
      textColor:{
        main: '#ee3131'
      },
      borderColor:{
        main: '#ee3131'
      },
      flex:{
        '2': '2 2 0%',
        '3': '3 3 0%',
        '4': '4 4 0%',
        '5': '5 5 0%',
        '6': '6 6 0%',
        '7': '7 7 0%',
      },
      keyframes:{
        'slide-top': {
          '0%': {
          '-webkit-transform': 'translateY(20px);',
                  transform: 'translateY(20px);'
          },
          '100%':{
          '-webkit-transform': 'translateY(0px);',
                  transform: 'translateY(0px);'
        }},
        'slide-top-sm': {
          '0%': {
          '-webkit-transform': 'translateY(8px);',
                  transform: 'translateY(8px);'
          },
          '100%':{
          '-webkit-transform': 'translateY(0px);',
                  transform: 'translateY(0px);'
        }},
        'slide-right': {
          '0%': {
            '-webkit-transform': 'translateX(-1000px);',
                    transform: 'translateX(-1000px);'
          },
         '100%': {
            '-webkit-transform': 'translateX(0);',
                    transform: 'translateX(0);'
        }},
        'scale-up-center': {
          '0%': {
            '-webkit-transform': 'scale(0.5);',
                    transform: 'scale(0.5);'
          },
          '100%': {
           ' -webkit-transform':'scale(1);',
                    transform: 'scale(1);'
          }
        },
        'scale-in-center': {
          '0%': {
            '-webkit-transform': 'scale(0.95);',
                   'transform': 'scale(0.95);',
                    opacity: '0.9;'
          },
          '100%': {
            '-webkit-transform': 'scale(1);',
                    'transform': 'scale(1);',
            opacity: '1;'
          }
        },
        'color-change-2x': {
          '0%': {
            'background': '#19dcea;'
          },
          '100%': {
            'background': '#b22cff;'
          }
        },
        'shadow-pop-tr': {
          '0%': {
            '-webkit-box-shadow': '0 0 #3e3e3e, 0 0 #3e3e3e, 0 0 #3e3e3e, 0 0 #3e3e3e, 0 0 #3e3e3e, 0 0 #3e3e3e, 0 0 #3e3e3e, 0 0 #3e3e3e;',
                    'box-shadow': '0 0 #3e3e3e, 0 0 #3e3e3e, 0 0 #3e3e3e, 0 0 #3e3e3e, 0 0 #3e3e3e, 0 0 #3e3e3e, 0 0 #3e3e3e, 0 0 #3e3e3e;',
            '-webkit-transform': 'translateX(0) translateY(0);',
                    transform: 'translateX(0) translateY(0);'
          },
          '100%': {
            '-webkit-box-shadow': '1px -1px #3e3e3e, 2px -2px #3e3e3e, 3px -3px #3e3e3e, 4px -4px #3e3e3e, 5px -5px #3e3e3e, 6px -6px #3e3e3e, 7px -7px #3e3e3e, 8px -8px #3e3e3e;',
                    'box-shadow': '1px -1px #3e3e3e, 2px -2px #3e3e3e, 3px -3px #3e3e3e, 4px -4px #3e3e3e, 5px -5px #3e3e3e, 6px -6px #3e3e3e, 7px -7px #3e3e3e, 8px -8px #3e3e3e;',
            '-webkit-transform': 'translateX(-8px) translateY(8px);',
                    transform: 'translateX(-8px) translateY(8px);'
          }
        },
        'shadow-drop-2-center': {
          '0%': {
            '-webkit-transform': 'translateZ(0);',
                    'transform': 'translateZ(0);',
            '-webkit-box-shadow': '0 0 0 0 rgba(0, 0, 0, 0);',
                    'box-shadow':' 0 0 0 0 rgba(0, 0, 0, 0);'
          },
          '100%': {
            '-webkit-transform': 'translateZ(50px);',
                    'transform': 'translateZ(50px);',
            '-webkit-box-shadow': '0 0 20px 0px rgba(0, 0, 0, 0.35);',
                    'box-shadow': '0 0 20px 0px rgba(0, 0, 0, 0.35);'
          }
        }
      },
      animation:{
        'slide-top': 'slide-top 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;',
        'slide-top-sm': 'slide-top 0.2s linear both;',
        'slide-right': 'slide-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;',
        'scale-up-center': 'scale-up-center 0.15s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;',
        'scale-in-center': 'scale-in-center 0.8s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;',
        'color-change-2x' : 'color-change-2x 5s linear infinite alternate both;',
        'shadow-pop-tr' : 'shadow-pop-tr 0.4s cubic-bezier(0.470, 0.000, 0.745, 0.715) both;',
        'shadow-drop-2-center' : 'shadow-drop-2-center 0.4s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;'
      },
    },
    listStyleType: {
      none: 'none',
      disc: 'disc',
      decimal: 'decimal',
      square: 'square',
      roman: 'upper-roman',
    }
  },
  plugins: [require("@tailwindcss/line-clamp"),
            require('@tailwindcss/forms')({
              strategy:'class'
            }),
            require('tailwind-scrollbar')
          ],
  // mode: 'jit',
}

