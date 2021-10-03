<p align="center">
<img src="src-tauri/icons/128x128.png" width="100">
<h1 align="center"><i><strong>BLOOP</strong></i></h1>
A light weight hackable scratch pad for developers inspired from boop.<br/>
Run scripts (written in JS) directly over any piece of text!<br/>
Base64? EZ. Got an unreadable JSON? parse it! Just want to count characters? Well we got you covered.<br/>
Or just use it to take notes, data persists in local storage :)<br/>
The tool aims to be an exact imitation of boop built using web technologies and powered by <a href="https://tauri.studio">Tauri</a>.
</p>

<p align="center">
    <img src="src-tauri/assets/UI.png?raw=true" width="663" alt="UI screenshot">
</p>

<p align="center">
  <a href="https://github.com/Blakeinstein/Bloop/releases"><img src="https://github.com/Blakeinstein/Bloop/workflows/Release/badge.svg"></a>  <a href="https://github.com/Blakeinstein/Bloop/"><img src="https://img.shields.io/github/issues/Blakeinstein/Bloop"></a>  <a href="https://github.com/Blakeinstein/Bloop/stargazers"><img src="https://img.shields.io/github/stars/Blakeinstein/Bloop"></a>
</p>

<p align="center">
  <a href="https://boop.okat.best/">Inspired from Boop</a>  •  <a href="https://github.com/Blakeinstein/Bloop/wiki/Getting-Started">Documentation</a>  •  <a href="https://github.com/IvanMathy/Boop/tree/main/Scripts">Find more scripts</a>
</p>


### Documentation
New? Read how to use bloop [here](https://github.com/Blakeinstein/Bloop/wiki/Getting-Started)
#### Suggestions
To add custom scripts add the scripts to your documents directory which you can confirm [here](https://docs.rs/dirs-next/2.0.0/dirs_next/fn.document_dir.html)

Bloop supports ligaturized fonts, Some fonts are set up by default, but require you to install them manually. You can also use your own fonts, by changing `config.toml`. Suggested fonts =>
* [SF Mono ligaturized](https://github.com/kube/sf-mono-ligaturized/tree/master/ligaturized)
* [Cascadia Code](https://github.com/microsoft/cascadia-code)


### How to get Bloop
You can obtain installer/binaries for your platform [here](https://github.com/Blakeinstein/Bloop/releases).

---
Alternatively you can compile it yourself.

> Only for developers.

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
