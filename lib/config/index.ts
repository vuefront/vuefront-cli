import * as _ from 'lodash'
import * as fs from 'fs'
let rootPath = ''

const mergeConfig = (objValue: VueFrontConfig, srcValue: VueFrontConfig, index: string): VueFrontConfig => {
  if(index !== 'locales') {
    if (_.isArray(objValue)) {
      return _.concat(objValue, srcValue) as VueFrontConfig
    } else if (_.isObject(objValue)) {
      return _.merge(objValue, srcValue)
    } else {
      return srcValue
    }
  } else if(_.includes(['atoms', 'layouts', 'molecules', 'organisms', 'extensions'], index)) {
    if (_.isArray(objValue)) {
      return _.concat(objValue, srcValue) as VueFrontConfig
    } else if (_.isObject(objValue)) {
      return _.merge(objValue, srcValue)
    } else {
      return srcValue
    }
   } else {
    return _.mergeWith(objValue, srcValue, mergeConfig)
  }
}

const checkPath = (path: string) => {
  const newPath = _.replace(path, /^(~)/, rootPath + '/src')
  try {
    require.resolve(newPath)
    return true
  } catch (e) {
    return false
   }
}

const convertComponentPath = (items: VueFrontComponentList, root: string) => {
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
      if(checkPath(component)) {
        compResult = {
          type: 'full',
          path: component
        }
      } else if(checkPath(root + '/' +component)) {
        compResult = {
          type: 'full',
          path: root + '/' +component,
        }
      } else {
        compResult = {
          type: 'inside',
          path: root,
          component,
        }
      }
    }
    if (!_.isUndefined(css)) {
      if(checkPath(css)) {
        compResult = {
          ...compResult,
          css
        }
      } else if(checkPath(root + '/' +css)) {
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

const convertPath = (config: VueFrontConfig): VueFrontConfig => {
  const result: VueFrontConfig = {}

  if (config.atoms) {
    result.atoms = convertComponentPath(config.atoms as VueFrontComponentList, config.root?.components || '')
  }
  if (config.molecules) {
    result.molecules = convertComponentPath(config.molecules as VueFrontComponentList, config.root?.components || '')
  }
  if (config.organisms) {
    result.organisms = convertComponentPath(config.organisms as VueFrontComponentList, config.root?.components || '')
  }
  if (config.templates) {
    result.templates = convertComponentPath(config.templates as VueFrontComponentList, config.root?.components || '')
  }
  if (config.pages) {
    result.pages = convertComponentPath(config.pages as VueFrontComponentList, config.root?.components || '')
  }
  if (config.loaders) {
    result.loaders = convertComponentPath(config.loaders as VueFrontComponentList, config.root?.components || '')
  }
  if (config.extensions) {
    result.extensions = convertComponentPath(config.extensions as VueFrontComponentList, config.root?.components || '')
  }

  if(config.store) {
    result.store = {}
    for (const key in config.store) {
      let storeResult: VuefrontStore = config.store[key]
      if (_.isArray(storeResult.path)) {
        storeResult.path = storeResult.path.join('|modules|').split('|')
      }
      if(!config.store[key].module) {
        storeResult = config.store[key]
      } else {
        if (typeof config.store[key].module === 'string' ) {
          if(checkPath(config.store[key].module as string)) {
            storeResult.module = {              
              type: 'full',
              path: config.store[key].module as string
            }
          } else if (checkPath(config?.root?.store + '/' + config.store[key].module)) {
            storeResult.module = {
              type: 'full',
              path: config?.root?.store + '/' + config.store[key].module
            }
          } else {
            storeResult.module = {
              type: 'inside',
              path: config?.root?.store || '',
              component: config.store[key].module as string
            }
          }
        }
        
      }
      let storeKey = ''
      if (_.isArray(storeResult.path)) {
        storeKey = storeResult.path.map(val => (_.capitalize(val))).join('')
      }
      if (_.isString(storeResult?.path)) {
        storeKey = storeResult.path
      }
      if (result.store) {
        result.store[storeKey] = storeResult
      }
    }
  }

  if(config.locales) {
    result.locales = {}
    for (const key in config.locales) {
      result.locales[key] = []
      const locale = config.locales[key]
      for (const key2 in locale) {
        const locale2 = locale[key2]
        if (typeof locale2 === 'string') {
          if(checkPath(locale2 as string)) {
            result.locales[key].push({
              type: 'full',
              path: locale2 as string
            })
          } else if (checkPath(config?.root?.locales + '/' + locale2)) {
            result.locales[key].push({
              type: 'full',
              path: config?.root?.locales + '/' + (locale2 as string)
            })
          } else {
            result.locales[key].push({
              type: 'inside',
              path: config.root?.locales || '',
              component: locale2 as string
            })
          }
        }
      }
    }
  }

  return result
}

const cloneConfig = (config: VueFrontConfig): VueFrontConfig => {
  return JSON.parse(JSON.stringify(config))
}

export default async (rootDir: string): Promise<VueFrontConfig> => {
  let themeOptions: VueFrontConfig = {}
  const defaultConfigPath = require.resolve(rootDir + '/node_modules/vuefront');

  if (!fs.existsSync(defaultConfigPath)) {
    throw new Error('No found VueFront');
  }
  const vuefrontDefaultConfig = await import(defaultConfigPath)
  themeOptions = cloneConfig(vuefrontDefaultConfig)
  rootPath = rootDir

  themeOptions = {...themeOptions,...convertPath(vuefrontDefaultConfig)}
  const localConfig = require.resolve(rootDir + '/vuefront.config')
  console.log(localConfig)
  if (!fs.existsSync(localConfig)) {
    throw new Error('No found VueFront Config');
  }
  const themeConfig = await import(localConfig)
  let config = cloneConfig(themeConfig)
  config = {...config, ...convertPath(config)}
  if (typeof config.app !== 'undefined') {
    for(const key in config.app) {
      const appConfigPath = require.resolve(rootDir + '/node_modules/' + config.app[key])
      let customAppConfig = await import(appConfigPath)
      customAppConfig = customAppConfig.default || customAppConfig
      let customAppOptions = cloneConfig(customAppConfig)
      customAppOptions = {...customAppOptions, ...convertPath(customAppOptions)}
      themeOptions = _.mergeWith(themeOptions, customAppOptions, mergeConfig)
    }
  }

  if (typeof config.theme !== 'undefined') {
      const themeConfigPath = require.resolve(rootDir + '/node_modules/' + config.theme)
    let customThemeConfig = await import(themeConfigPath)
    customThemeConfig = customThemeConfig.default || customThemeConfig
    let customThemeOptions = cloneConfig(customThemeConfig)
    customThemeOptions = {...customThemeOptions, ...convertPath(customThemeOptions)}
    themeOptions = _.mergeWith(themeOptions, customThemeOptions, mergeConfig)
  }
  themeOptions = _.mergeWith(themeOptions, config, mergeConfig)

  return themeOptions

}

export class VuefrontConfig {
  private _rootDir: string;

  private _atoms: VueFrontComponentList = {};
  private _molecules: VueFrontComponentList = {};
  private _organisms: VueFrontComponentList = {};
  private _templates: VueFrontComponentList = {};
  private _pages: VueFrontComponentList = {};
  private _loaders: VueFrontComponentList = {};
  private _extensions: VueFrontComponentList = {};
  
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
  }
  public async load() {
    let themeOptions: VueFrontConfig = {}
    const defaultConfigPath = require.resolve(this._rootDir + '/node_modules/vuefront');
  
    if (!fs.existsSync(defaultConfigPath)) {
      throw new Error('No found VueFront');
    }
    const vuefrontDefaultConfig = await import(defaultConfigPath)
    themeOptions = cloneConfig(vuefrontDefaultConfig)
    rootPath = this._rootDir
  
    themeOptions = {...themeOptions,...convertPath(vuefrontDefaultConfig)}
    const localConfig = require.resolve(this._rootDir + '/vuefront.config')
    console.log(localConfig)
    if (!fs.existsSync(localConfig)) {
      throw new Error('No found VueFront Config');
    }
    const themeConfig = await import(localConfig)
    let config = cloneConfig(themeConfig)
    config = {...config, ...convertPath(config)}
    if (typeof config.app !== 'undefined') {
      for(const key in config.app) {
        const appConfigPath = require.resolve(rootDir + '/node_modules/' + config.app[key])
        let customAppConfig = await import(appConfigPath)
        customAppConfig = customAppConfig.default || customAppConfig
        let customAppOptions = cloneConfig(customAppConfig)
        customAppOptions = {...customAppOptions, ...convertPath(customAppOptions)}
        themeOptions = _.mergeWith(themeOptions, customAppOptions, mergeConfig)
      }
    }
  
    if (typeof config.theme !== 'undefined') {
        const themeConfigPath = require.resolve(rootDir + '/node_modules/' + config.theme)
      let customThemeConfig = await import(themeConfigPath)
      customThemeConfig = customThemeConfig.default || customThemeConfig
      let customThemeOptions = cloneConfig(customThemeConfig)
      customThemeOptions = {...customThemeOptions, ...convertPath(customThemeOptions)}
      themeOptions = _.mergeWith(themeOptions, customThemeOptions, mergeConfig)
    }
    themeOptions = _.mergeWith(themeOptions, config, mergeConfig)
  
    return themeOptions
  }

  private convertPath (config: VueFrontConfig): VueFrontConfig {
    const result: VueFrontConfig = {}
  
    if (config.atoms) {
      result.atoms = convertComponentPath(config.atoms as VueFrontComponentList, config.root?.components || '')
    }
    if (config.molecules) {
      result.molecules = convertComponentPath(config.molecules as VueFrontComponentList, config.root?.components || '')
    }
    if (config.organisms) {
      result.organisms = convertComponentPath(config.organisms as VueFrontComponentList, config.root?.components || '')
    }
    if (config.templates) {
      result.templates = convertComponentPath(config.templates as VueFrontComponentList, config.root?.components || '')
    }
    if (config.pages) {
      result.pages = convertComponentPath(config.pages as VueFrontComponentList, config.root?.components || '')
    }
    if (config.loaders) {
      result.loaders = convertComponentPath(config.loaders as VueFrontComponentList, config.root?.components || '')
    }
    if (config.extensions) {
      result.extensions = convertComponentPath(config.extensions as VueFrontComponentList, config.root?.components || '')
    }
  
    if(config.store) {
      result.store = {}
      for (const key in config.store) {
        let storeResult: VuefrontStore = config.store[key]
        if (_.isArray(storeResult.path)) {
          storeResult.path = storeResult.path.join('|modules|').split('|')
        }
        if(!config.store[key].module) {
          storeResult = config.store[key]
        } else {
          if (typeof config.store[key].module === 'string' ) {
            if(checkPath(config.store[key].module as string)) {
              storeResult.module = {              
                type: 'full',
                path: config.store[key].module as string
              }
            } else if (checkPath(config?.root?.store + '/' + config.store[key].module)) {
              storeResult.module = {
                type: 'full',
                path: config?.root?.store + '/' + config.store[key].module
              }
            } else {
              storeResult.module = {
                type: 'inside',
                path: config?.root?.store || '',
                component: config.store[key].module as string
              }
            }
          }
          
        }
        let storeKey = ''
        if (_.isArray(storeResult.path)) {
          storeKey = storeResult.path.map(val => (_.capitalize(val))).join('')
        }
        if (_.isString(storeResult?.path)) {
          storeKey = storeResult.path
        }
        if (result.store) {
          result.store[storeKey] = storeResult
        }
      }
    }
  
    if(config.locales) {
      result.locales = {}
      for (const key in config.locales) {
        result.locales[key] = []
        const locale = config.locales[key]
        for (const key2 in locale) {
          const locale2 = locale[key2]
          if (typeof locale2 === 'string') {
            if(checkPath(locale2 as string)) {
              result.locales[key].push({
                type: 'full',
                path: locale2 as string
              })
            } else if (checkPath(config?.root?.locales + '/' + locale2)) {
              result.locales[key].push({
                type: 'full',
                path: config?.root?.locales + '/' + (locale2 as string)
              })
            } else {
              result.locales[key].push({
                type: 'inside',
                path: config.root?.locales || '',
                component: locale2 as string
              })
            }
          }
        }
      }
    }
  
    return result
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
        if(checkPath(component)) {
          compResult = {
            type: 'full',
            path: component
          }
        } else if(checkPath(root + '/' +component)) {
          compResult = {
            type: 'full',
            path: root + '/' +component,
          }
        } else {
          compResult = {
            type: 'inside',
            path: root,
            component,
          }
        }
      }
      if (!_.isUndefined(css)) {
        if(checkPath(css)) {
          compResult = {
            ...compResult,
            css
          }
        } else if(checkPath(root + '/' +css)) {
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
  

  private cloneData(config: VueFrontConfig): VueFrontConfig => {
    return JSON.parse(JSON.stringify(config))
  }
}