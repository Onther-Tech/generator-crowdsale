'use strict';
const Generator = require('yeoman-generator');
const commandExists = require('command-exists').sync;
const yosay = require('yosay');
const chalk = require('chalk');
const wiredep = require('wiredep');
const mkdirp = require('mkdirp');
const _s = require('underscore.string');
var ncp = require('ncp').ncp;

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
  }

  // initializing() {
  //   this.pkg = require('../package.json');
  //   this.composeWith(
  //     require.resolve(`generator-${this.options['test-framework']}/generators/app`),
  //     { 'skip-install': this.options['skip-install'] }
  //   );
  // }

  prompting() {
    if (!this.options['skip-welcome-message']) {
      this.log(yosay('\'Allo \'allo! Out of the box I include HTML5 Boilerplate, jQuery, and a gulpfile to build your app.'));
    }

    const prompts = [
    {
      type: 'list',
      name: 'token_type',
      message: 'Which version of Token would you like to use?',
      choices: [
      {
        name: 'zeppelin',
        value: 'zeppelin'
      }, {
        name: 'minime',
        value: 'minime'
      }]
    }, {
      type: 'checkbox',
      name: 'token_features',
      message: 'Which additional features would you like to include in token contract?',
      choices: [{
        name: 'Burnable',
        value: 'includeBurnable',
        checked: true
      }, {
        name: 'Pausable',
        value: 'includePausable',
        checked: true
      }, {
        name: 'Mintable',
        value: 'includeMintable',
        checked: true
      }, {
        name: 'Vesting',
        value: 'includeVesting',
        checked: true
      }],
      when: answers => answers.token_type == 'zeppelin'
    }];

    return this.prompt(prompts).then(answers => {
      const token_features = answers.token_features;
      const hasTokenFeature = feat => token_features && token_features.indexOf(feat) !== -1;

      // manually deal with the response, get back and store the results.
      // we change a bit this way of doing to automatically do this in the self.prompt() method.
      this.includeBurnable = hasTokenFeature('includeBurnable');
      this.includePausable = hasTokenFeature('includePausable');
      this.includeMintable = hasTokenFeature('includeMintable');
      this.includeVesting = hasTokenFeature('includeVesting');
      this.token_type = answers.token_type;
    });
  }

  writing() {
    mkdirp('contracts');
    this._writingBaseContractfile();
    this._writingTokenContractfile();
    // this._writingGulpfile();
    // this._writingPackageJSON();
    // this._writingBabel();
    // this._writingGit();
    // this._writingBower();
    // this._writingEditorConfig();
    // this._writingH5bp();
    // this._writingStyles();
    // this._writingScripts();
    // this._writingHtml();
    // this._writingMisc();
  }

  _writingBaseContractfile() {
    ncp(this.templatePath('zeppelin'), this.destinationPath('contracts/zeppelin'));
    ncp(this.templatePath('minime'), this.destinationPath('contracts/minime'));
  }

  _writingTokenContractfile() {
    if (this.token_type == 'zeppelin') {
      this.fs.copyTpl(
        this.templatePath('zeppelin_token.sol'),
        this.destinationPath('contracts/token.sol'),
        {
          _name: "TestToken",
          _symbol: "TT",
          _decimals: 18,
          includeBurnable: this.includeBurnable,
          includePausable: this.includePausable,
          includeMintable: this.includeMintable,
          includeVesting: this.includeVesting
        }
      )
    }
    if (this.token_type == 'minime') {
      this.fs.copyTpl(
        this.templatePath('minime_token.sol'),
        this.destinationPath('contracts/token.sol'),
        {
          _name: "TestToken",
          _symbol: "TT",
          _decimals: 18,
          includeBurnable: this.includeBurnable,
          includePausable: this.includePausable,
          includeMintable: this.includeMintable,
          includeVesting: this.includeVesting
        }
      )
    }
  }

  _writingGulpfile() {
    this.fs.copyTpl(
      this.templatePath('gulpfile.js'),
      this.destinationPath('gulpfile.js'),
      {
        date: (new Date).toISOString().split('T')[0],
        name: this.pkg.name,
        version: this.pkg.version,
        includeSass: this.includeSass,
        includeBootstrap: this.includeBootstrap,
        legacyBootstrap: this.legacyBootstrap,
        includeBabel: this.options['babel'],
        testFramework: this.options['test-framework']
      }
    );
  }

  _writingPackageJSON() {
    this.fs.copyTpl(
      this.templatePath('_package.json'),
      this.destinationPath('package.json'),
      {
        includeSass: this.includeSass,
        includeBabel: this.options['babel'],
        includeJQuery: this.includeJQuery,
      }
    );
  }

  _writingBabel() {
    this.fs.copy(
      this.templatePath('babelrc'),
      this.destinationPath('.babelrc')
    );
  }

  _writingGit() {
    this.fs.copy(
      this.templatePath('gitignore'),
      this.destinationPath('.gitignore'));

    this.fs.copy(
      this.templatePath('gitattributes'),
      this.destinationPath('.gitattributes'));
  }

  _writingBower() {
    const bowerJson = {
      name: _s.slugify(this.appname),
      private: true,
      dependencies: {}
    };

    if (this.includeBootstrap) {

      // Bootstrap 4
      bowerJson.dependencies = {
        'bootstrap': '~4.0.0-alpha.6'
      };

      // Bootstrap 3
      if (this.legacyBootstrap) {
        if (this.includeSass) {
          bowerJson.dependencies = {
            'bootstrap-sass': '~3.3.5'
          };
          bowerJson.overrides = {
            'bootstrap-sass': {
              'main': [
                'assets/stylesheets/_bootstrap.scss',
                'assets/fonts/bootstrap/*',
                'assets/javascripts/bootstrap.js'
              ]
            }
          };
        } else {
          bowerJson.dependencies = {
            'bootstrap': '~3.3.5'
          };
          bowerJson.overrides = {
            'bootstrap': {
              'main': [
                'less/bootstrap.less',
                'dist/css/bootstrap.css',
                'dist/js/bootstrap.js',
                'dist/fonts/*'
              ]
            }
          };
        }
      }

    } else if (this.includeJQuery) {
      bowerJson.dependencies['jquery'] = '~2.1.1';
    }

    if (this.includeModernizr) {
      bowerJson.dependencies['modernizr'] = '~2.8.1';
    }

    this.fs.writeJSON('bower.json', bowerJson);
    this.fs.copy(
      this.templatePath('bowerrc'),
      this.destinationPath('.bowerrc')
    );
  }

  _writingEditorConfig() {
    this.fs.copy(
      this.templatePath('editorconfig'),
      this.destinationPath('.editorconfig')
    );
  }

  _writingH5bp() {
    this.fs.copy(
      this.templatePath('favicon.ico'),
      this.destinationPath('app/favicon.ico')
    );

    this.fs.copy(
      this.templatePath('apple-touch-icon.png'),
      this.destinationPath('app/apple-touch-icon.png')
    );

    this.fs.copy(
      this.templatePath('robots.txt'),
      this.destinationPath('app/robots.txt'));
  }

  _writingStyles() {
    let css = 'main';

    if (this.includeSass) {
      css += '.scss';
    } else {
      css += '.css';
    }

    this.fs.copyTpl(
      this.templatePath(css),
      this.destinationPath('app/styles/' + css),
      {
        includeBootstrap: this.includeBootstrap,
        legacyBootstrap: this.legacyBootstrap
      }
    );
  }

  _writingScripts() {
    this.fs.copy(
      this.templatePath('main.js'),
      this.destinationPath('app/scripts/main.js')
    );
  }

  _writingHtml() {
    let bsPath, bsPlugins;

    // path prefix for Bootstrap JS files
    if (this.includeBootstrap) {

      // Bootstrap 4
      bsPath = '/bower_components/bootstrap/js/dist/';
      bsPlugins = [
        'util',
        'alert',
        'button',
        'carousel',
        'collapse',
        'dropdown',
        'modal',
        'scrollspy',
        'tab',
        'tooltip',
        'popover'
      ];

      // Bootstrap 3
      if (this.legacyBootstrap) {
        if (this.includeSass) {
          bsPath = '/bower_components/bootstrap-sass/assets/javascripts/bootstrap/';
        } else {
          bsPath = '/bower_components/bootstrap/js/';
        }
        bsPlugins = [
          'affix',
          'alert',
          'dropdown',
          'tooltip',
          'modal',
          'transition',
          'button',
          'popover',
          'carousel',
          'scrollspy',
          'collapse',
          'tab'
        ];
      }
    }

    this.fs.copyTpl(
      this.templatePath('index.html'),
      this.destinationPath('app/index.html'),
      {
        appname: this.appname,
        includeSass: this.includeSass,
        includeBootstrap: this.includeBootstrap,
        legacyBootstrap: this.legacyBootstrap,
        includeModernizr: this.includeModernizr,
        includeJQuery: this.includeJQuery,
        bsPath: bsPath,
        bsPlugins: bsPlugins
      }
    );
  }

  _writingMisc() {
    mkdirp('app/images');
    mkdirp('app/fonts');
  }

//   install() {
//     const hasYarn = commandExists('yarn');
//     this.installDependencies({
//       npm: !hasYarn,
//       bower: true,
//       yarn: hasYarn,
//       skipMessage: this.options['skip-install-message'],
//       skipInstall: this.options['skip-install']
//     });
//   }
//
//   end() {
//     const bowerJson = this.fs.readJSON(this.destinationPath('bower.json'));
//     const howToInstall = `
// After running ${chalk.yellow.bold('npm install & bower install')}, inject your
// front end dependencies by running ${chalk.yellow.bold('gulp wiredep')}.`;
//
//     if (this.options['skip-install']) {
//       this.log(howToInstall);
//       return;
//     }
//
//     // wire Bower packages to .html
//     wiredep({
//       bowerJson: bowerJson,
//       directory: 'bower_components',
//       exclude: ['bootstrap-sass', 'bootstrap.js'],
//       ignorePath: /^(\.\.\/)*\.\./,
//       src: 'app/index.html'
//     });
//
//     if (this.includeSass) {
//       // wire Bower packages to .scss
//       wiredep({
//         bowerJson: bowerJson,
//         directory: 'bower_components',
//         ignorePath: /^(\.\.\/)+/,
//         src: 'app/styles/*.scss'
//       });
//     }
//   }
}
