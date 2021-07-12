# Bloop.
<p align="center">
A light weight hackable scratch pad for developers inspired from boop.<br/>
The tool aims to be an exact imitation of boop built using web technologies and powered by <a href="https://tauri.studio">Tauri</a>.
</p>

<p align="center">
    <img src="assets/UI.png?raw=true" width="663" alt="UI screenshot">
</p>

<p align="center">
  <a href="https://github.com/Blakeinstein/Bloop/releases"><img src="https://github.com/Blakeinstein/Bloop/workflows/Release/badge.svg"></a>  <a href="https://github.com/Blakeinstein/Bloop/"><img src="https://img.shields.io/github/issues/Blakeinstein/Bloop"></a>  <a href="https://github.com/Blakeinstein/Bloop/stargazers"><img src="https://img.shields.io/github/stars/Blakeinstein/Bloop"></a>
</p>

<p align="center">
  <a href="https://boop.okat.best/">Inspired from Boop</a>  •  <a href="https://github.com/Blakeinstein/Bloop/wiki/Getting-Started">Documentation</a>  •  <a href="https://github.com/IvanMathy/Boop/tree/main/Scripts">Find more scripts</a>
</p>

#### Suggestions
To add custom scripts add the scripts to your documents directory which you can confirm [here](https://docs.rs/dirs-next/2.0.0/dirs_next/fn.document_dir.html)

As bloop supports some ligaturized fonts, I suggest that you install these fonts manually!
Until preferences are implemented, you are stuck with the following fonts.
* [SF Mono ligaturized](https://github.com/kube/sf-mono-ligaturized/tree/master/ligaturized)
* [Cascadia Code](https://github.com/microsoft/cascadia-code)

### Documentation
New? Read how to use bloop [here](https://github.com/Blakeinstein/Bloop/wiki/Getting-Started)

### How to get Bloop

For the time being the only way to obtain a working copy is to either get the installer from [here](https://github.com/Blakeinstein/Bloop/releases). or compile it yourself.

> Archive files like tar.gz, msi.zip, appimage.tar.gz are update images that can be ignored.

### How to build from source

- ####  Config
  - ##### Setup Tauri and Yarn
    - Follow the setup guide from their [docs](https://tauri.studio/en/docs/getting-started/intro)
  - ##### Get Boop scripts
    - Get the base scripts from boop
    ```bash
      mkdir src-tauri
      git clone http://github.com/ivanmathy/boop
      mv boop/Boop/Boop/scripts src-tauri/
    ```
  - ##### Build web component
    - Install app dependencies and build it
    ```bash
      yarn && yarn build
    ```
  - ##### Copy data over to replicate tauri config
    ```bash
      mv dist src-tauri/
      mv src src-tauri/
      mv config src-tauri/
      mv icons src-tauri/
      mv ./Cargo.toml src-tauri/
      mv ./tauri.conf.json src-tauri/
      mv ./build.rs src-tauri/
    ```
 - #### Build
   -  To build release binaries, use ``` yarn release ```, The resultant binaries would be located in ```src-tauri/target/release```

<!-- ##### TODO -->
<!-- - [Documentation](https://github.com/Blakeinstein/Bloop/wiki)
- [Custom scripts](https://github.com/Blakeinstein/Bloop/wiki#CustomScripts) -->
