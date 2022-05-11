import * as _ from 'lodash'
import * as fs from 'fs'

export class VuefrontConfig {
  private _rootDir: string;

  private _atoms: VueFrontComponentList = {}
  private _molecules: VueFrontComponentList = {}
  private _organisms: VueFrontComponentList = {}
  private _templates: VueFrontComponentList = {}
  private _pages: VueFrontComponentList = {}
  private _loaders: VueFrontComponentList = {}
  private _extensions: VueFrontComponentList = {}

  private _root: VueFrontConfigRoot = {};
  private _store?: VuefrontStoreList;
  private _theme?: string;
  private _app: string[] = [];
  private _css: string[] = [];
  private _locales: VuefrontLocalesList = {};
  private _seo: VueFrontSeoList = {};
  private _image: VueFrontImageList = {};
  private _images: VueFrontImageList = {};

  constructor(rootDir: string = process.cwd()) {
    this._rootDir = rootDir;
  }
  private async _loadConfig(path: string) {
    const configPath = require.resolve(path);

    if (!fs.existsSync(configPath)) {
      throw new Error('No found Config ' + configPath);
    }

    const config = await import(configPath)
    this._parseConfig(config)
  }
  public get localConfigPath() {
    const configPath = require.resolve(this._rootDir + '/vuefront.config');

    if (fs.existsSync(configPath)) {
      return configPath;
    }

    return null
  }

  public async addComponentToLocalConfig(key: VueFrontComponentKey, name: string, path: string) {
    if (!this.localConfigPath) {
      console.error('Local VueFront config not found ')
      throw new Error('Local VueFront config not found ')
    }
    let content = fs.readFileSync(this.localConfigPath).toString()

    const regex = new RegExp(`${key}:\\s?{`)
    const regexBegin = /module.exports[\s]+=[\s]+{/;
    path = _.replace(path, this._rootDir + '/src', "~")

    if (regex.test(content)) {
      content = content.replace(
        regex,
        `${key}: {\n    ${name}: "${path}",\n`
      )
    } else {
      content = content.replace(
        regexBegin,
        `module.exports = {\n  ${key}: {\n    ${name}: "${path}",\n  },`
      )
    }

    fs.writeFileSync(this.localConfigPath, content)
  }
  public async load() {
    await this._loadConfig(this._rootDir + '/node_modules/vuefront')
    if (this.localConfigPath) 
      await this._loadConfig(this.localConfigPath)
    for(const key in this._app) {
      await this._loadConfig(this._rootDir + '/node_modules/' + this._app[key])
    }
    if (this._theme) {
      await this._loadConfig(this._rootDir + '/node_modules/' + this._theme)
    }
  }

  private _parseConfig (config: VueFrontConfigData) {
    if (config.theme) {
      this._theme = config.theme
    }
    if (config.app) {
      this._app = {
        ...this._app,
        ...config.app
      }
    }
    if (config.atoms) {
      this._atoms = {
        ...this._atoms,
        ...this._convertComponentPath(config.atoms, config.root?.components || '')
      }
    }
    if (config.molecules) {
      this._molecules = {
        ...this._molecules,
        ...this._convertComponentPath(config.molecules, config.root?.components || '')
      }
    }
    if (config.organisms) {
      this._organisms = {
        ...this._organisms,
        ...this._convertComponentPath(config.organisms, config.root?.components || '')
      }
    }
    if (config.templates) {
      this._templates = {
        ...this._templates,
        ...this._convertComponentPath(config.templates, config.root?.components || '')
      }
    }
    if (config.pages) {
      this._pages = {
        ...this._pages,
        ...this._convertComponentPath(config.pages, config.root?.components || '')
      }
    }
    if (config.loaders) {
      this._loaders = {
        ...this._loaders,
        ...this._convertComponentPath(config.loaders, config.root?.components || '')
      }
    }
    if (config.extensions) {
      this._extensions = {
        ...this._extensions,
        ...this._convertComponentPath(config.extensions, config.root?.components || '')
      }
    }
  }
  
  private _convertComponentPath (items: VueFrontComponentList, root: string) {
    const result: VueFrontComponentList = {}
    if(!items) {
      return
    }
    const category = items
    for(const key in category) {
      let component = undefined
      let css = undefined
      if (typeof category[key] === 'string') {
        component = category[key] as string
      } else {
        css = (category[key] as VueFrontComponent).css
        component = (category[key] as VueFrontComponent).component
      }
      let compResult: VueFrontComponent = {}
  
      if (!_.isUndefined(component)) {
        if(this._checkPath(component)) {
          compResult = {
            type: 'full',
            path: component,
            fullPath: this._getPath(component)
          }
        } else if(this._checkPath(root + '/' +component)) {
          compResult = {
            type: 'full',
            path: root + '/' +component,

            fullPath: this._getPath(root + '/' +component)
          }
        } else {
          compResult = {
            type: 'inside',
            path: root,
            component,
            fullPath: this._getPath(root)
          }
        }
      }
      if (!_.isUndefined(css)) {
        if(this._checkPath(css)) {
          compResult = {
            ...compResult,
            css
          }
        } else if(this._checkPath(root + '/' +css)) {
          compResult = {
            ...compResult,
            css: root + '/' +css,
          }
        }
      }
      result[key] = compResult
    }
    return result
  }

  private _checkPath = (path: string) => {
    const newPath = _.replace(path, /^(~)/, this._rootDir + '/src')
    try {
      require.resolve(newPath)
      return true
    } catch (e) {
      return false
     }
  }
  private _getPath = (path: string) => {
    const newPath = _.replace(path, /^(~)/, this._rootDir + '/src')
    let result = path
    try {
      result = require.resolve(newPath)
    } catch (e) {
    }

    return result
  }

  public getComponentsFolder = () => {
    const folderPath = this._rootDir + '/src/components';

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, {recursive: true});
    }
    return folderPath
  }

  public get atoms(): VueFrontComponentList {
    return this._atoms
  }
  public set atoms(value: VueFrontComponentList) {
    this._atoms = value
  }
  public get molecules(): VueFrontComponentList {
    return this._molecules
  }
  public set molecules(value: VueFrontComponentList) {
    this._molecules = value
  }
  public get organisms(): VueFrontComponentList {
    return this._organisms
  }
  public set organisms(value: VueFrontComponentList) {
    this._organisms = value
  }
  
  public get templates(): VueFrontComponentList {
    return this._templates
  }
  public set templates(value: VueFrontComponentList) {
    this._templates = value
  }
  public get pages(): VueFrontComponentList {
    return this._pages
  }
  public set pages(value: VueFrontComponentList) {
    this._pages = value
  }
  public get loaders(): VueFrontComponentList {
    return this._loaders
  }
  public set loaders(value: VueFrontComponentList) {
    this._loaders = value
  }
  public get extensions(): VueFrontComponentList {
    return this._extensions
  }
  public set extensions(value: VueFrontComponentList) {
    this._extensions = value
  }

  public getComponentPath(component: VueFrontComponent) {
    return this._rootDir + '/' + component.path
  }
  public detectComponentType(componentType: string): VueFrontComponentKey | null {
    let result: VueFrontComponentKey | null = null;

    switch(componentType) {
        case 'a':
        case 'atom':
        case 'atoms':
          result = 'atoms'
          break;
        case 'm':
        case 'molecule':
        case 'molecules':
          result = 'molecules'
          break;
        case 'o':
        case 'organism':
        case 'organisms':
          result = 'organisms'
          break;
        case 't':
        case 'template':
        case 'templates':
          result = 'templates'
          break;
        case 'p':
        case 'page':
        case 'pages':
          result = 'pages'
          break;
        case 'e':
        case 'extension':
        case 'extensions':
          result = 'extensions'
          break;
    }

    return result
}

  public getComponentFullPath(component: VueFrontComponent) {
    return component.fullPath ? component.fullPath : null
  }

  public getComponent(type: VueFrontComponentKey, name: string) {
    let result: VueFrontComponentList | null = null;
    switch(type) {
      case 'atoms': 
        result = this._atoms;
        break;
      case 'molecules':
        result = this._molecules;
        break
      case 'organisms':
        result = this._organisms;
        break;
      case 'templates':
        result = this._templates;
        break;
      case 'pages':
        result = this._pages;
        break;
      case 'loaders':
        result = this._loaders;
        break;
      case 'extensions':
        result = this._extensions
        break;
    }
    if (!result) {
      return null
    }

    if (!_.isUndefined(result[name])) {
      return result[name];
    }
    return null;
  }
}