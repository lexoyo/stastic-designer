console.log('custom client script loaded')

silex.subscribeSite((prev, next) => {
  if (next.publicationPath && prev.publicationPath !== next.publicationPath) {
    const folder = silex.getSite().publicationPath.url
    silex.loadComponents([
      './prodotype/components', 
      folder + '/.silex/components/',
      'components/',
    ])
  }
})
