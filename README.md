# Stastic designer

This is a work in progress to create a drag and drop universal template editor based on [Silex open source website builder](https://www.silex.me).

Right now it works with Jekyll and 11ty but nothing is documented yet

![Silex UI](https://user-images.githubusercontent.com/715377/36344714-bf264de2-141e-11e8-8c87-f698e96d91c9.png)

## Features

* [x] Desktop app to work locally and possibly offline
* [x] Online mode to work online without install - I have setup this [instance you can use to test it](https://design.stastic.net)
* [x] The "template" panel (`{ }` tab): write HTML+liquid and it will be inserted at publication time while still displaying the element in Silex and in preview mode
* [x] Publication for 11ty and Jekyll: each page becomes a layout, files are stored in the proper folders and formats (css, js, html, assets)
* [x] Load components in the "+" menu which are specific to a website and stored with the website
* [x] Tool to convert the selected element to a component 

![The "template" panel](https://user-images.githubusercontent.com/715377/185664883-ccada61d-857e-46c6-8d8e-4115d09ae1cc.png)


Included adapters

* [x] 11ty
* [x] jekyll
* [x] forestry
* [x] Salesforce Pardot

## Support and documentation

Please use the mother project's [Silex issues](https://github.com/silexlabs/Silex/issues) and [Silex documentation](https://github.com/silexlabs/Silex/wiki)

## Instructions

### Install

Please follow [Silex Desktop installation instructions](https://github.com/silexlabs/silex-desktop#silex-desktop).

### Designer

Create a website as you would in Silex, with one page in Silex for each page type in the final website

Select elements which you want to come from the CMS and make them "templates"

Publish the website to a folder containing a Jekyll or 11ty website, on github or on you local computer

### Developer

Look for custom components and Prodotype in Silex docs.

You can add custom components to a site, in a `components` folder beside the site HTML editable file.

You can add custom components to a Stastic instance, simply add them to the `components` folder in this repo.

## Local Development

If you want to work on your local hard drive, enable the `fs` service and start Silex like this:

```
$ npm install
$ npm run build
$ ENABLE_FS=true npm start
```

