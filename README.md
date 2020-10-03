# Stastic designer

This is a work in progress to create a drag and drop universal template editor based on [Silex open source website builder](https://www.silex.me).

Right now it works with Jekyll and 11ty but nothing is documented yet

![Silex UI](https://user-images.githubusercontent.com/715377/36344714-bf264de2-141e-11e8-8c87-f698e96d91c9.png)

## Features

* desktop install or use online
* A new property to make elements "templates", i.e. they will be displayed normally in Silex and in preview, but will be replaced during publication with a liquid template for Jekyll or 11ty
* When publishing a website, generate the forestry.io files to create a custom admin (page types, editor for each page type)

## Support and documentation

Please use the mother project's [Silex issues](https://github.com/silexlabs/Silex/issues) and [Silex documentation](https://github.com/silexlabs/Silex/wiki)

## Instructions

### Designer

Create a website as you would in Silex, with one page in Silex for each page type in the final website

Select elements which you want to come from the CMS and make them "templates"

Publish the website to a folder containing a Jekyll or 11ty website, on github or on you local computer

## Local Development

If you want to work on your local hard drive, enable the `fs` service and start Silex like this:

```
$ npm install
$ npm run build
$ ENABLE_FS=true npm start
```

