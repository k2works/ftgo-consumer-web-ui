// babel.config.js
console.log('babel.config.js');

export default {
  presets: [
    [ '@babel/preset-env',
      {
        'useBuiltIns': 'usage', // 'usage', // alternative mode: "entry"
        'corejs': '3.15',
        'targets': {
          'node': '12.22.1'
        },
        'shippedProposals': true,
        'modules': false,
        debug: true,
      },
    ],

  ],
  //  plugins: [
  //    // https://babeljs.io/docs/en/babel-plugin-transform-runtime#docsNav
  //    [
  //      '@babel/plugin-transform-runtime',
  //      {
  //        'regenerator': true,
  //      }
  //    ],
  ////    '@babel/plugin-transform-modules-commonjs',
  //    '@babel/plugin-proposal-export-namespace-from',
  //    '@babel/plugin-proposal-class-properties',
  //    //    '@babel/plugin-syntax-jsx'
  //  ]
};
