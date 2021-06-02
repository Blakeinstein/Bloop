# Bloop.
<p align="center">
A light weight scratch pad inspired and derived from boop.<br/>
The tool aims to be an exact imitation of boop built using web technologies and powered by my own fork of <a href="https://github.com/Boscop/web-view">webview-rs</a>, available <a href="https://github.com/Blakeinstein/web-view/">here</a>
</p>

<p align="center">
    <img src="assets/UI.png?raw=true" width="663" alt="UI screenshot">
</p>

<p align="center">
  <a href="https://github.com/Blakeinstein/Bloop/releases"><img src="https://github.com/Blakeinstein/Bloop/workflows/Release/badge.svg"></a>  <a href="https://github.com/Blakeinstein/Bloop/"><img src="https://img.shields.io/github/issues/Blakeinstein/Bloop"></a>  <a href="https://github.com/Blakeinstein/Bloop/stargazers"><img src="https://img.shields.io/github/stars/Blakeinstein/Bloop"></a>
</p>

<p align="center">
  <a href="https://boop.okat.best/">Inspired from Boop</a>  •  <a href="https://github.com/Blakeinstein/Bloop/blob/main/docs/Readme.md">Documentation</a>  •  <a href="https://github.com/IvanMathy/Boop/tree/main/Scripts">Find more scripts</a>
</p>

#### Suggestions
As bloop supports some ligaturized fonts, I suggest that you install these fonts manually!
Until preferences are implemented, you are stuck with the following fonts.
* [SF Mono ligaturized](https://github.com/kube/sf-mono-ligaturized/tree/master/ligaturized)
* [Cascadia Code](https://github.com/microsoft/cascadia-code)
### How to get Bloop

For the time being the only way to obtain a working copy is to either get the installer or portable binary from [here](https://github.com/Blakeinstein/Bloop/releases) or compile it yourself.

### How to build from source

- ####  Install Rust and Yarn
  - ##### Via Chocolatey
  > choco install rust yarn
  - ##### Manually
    - Get Rust up and running, from [Rust-lang](https://www.rust-lang.org/)
    - Install Yarn, from [yarnpkg](https://yarnpkg.com/)
- #### Installing windows 10 SDK
   * Webview for windows requires the latest sdk to be available on the dev environment.
   * Follow the following [guide](https://developer.microsoft.com/en-us/windows/downloads/windows-10-sdk/)
   * At the time of writing, 
   > Windows 10 SDK version: 10.0.19041.0
   > C++ toolset: 14.26
 - #### Get yarn/npm dependencies
   > yarn install
 - #### Build
   -  To just run the program, use ``` yarn run run ```
   -  To build release binaries, use ``` yarn release ```, The resultant binaries would be located in ```target/release```

### Planned features

- Preferences(fonts etc)
- light mode(Depends, not really interested)

### Documentation

- [Documentation](https://github.com/Blakeinstein/Bloop/wiki)
- [Custom scripts](https://github.com/Blakeinstein/Bloop/wiki#CustomScripts)
