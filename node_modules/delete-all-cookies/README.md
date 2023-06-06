# delete-all-cookies

This library exposes a function to clear all cookies that affect
the currently loaded web page.

This is accomplished by iteratively removing all cookies for the current
path, then the parent path, and so on, for the current domain, parent domain,
and so on, as well as cookies without explicit path and domain specification.

Sample interactive usage:

    // in source:
    window.clearCookies = require('delete-all-cookies')(window)
    
    // ES 6:
    import deleteAllCookiesFactory from 'delete-all-cookies'
    window.clearCookies = deleteAllCookiesFactory(window)

    // then, in console:
    clearCookies()

Usage in browsers:

    <script src="https://unpkg.com/delete-all-cookies/index.js"></script>
    
    <script>
      deleteAllCookies(window)
    </script>

## License

Released under the MIT license.

The code is derived from several
[Stack Overflow answers](http://stackoverflow.com/questions/179355/clearing-all-cookies-with-javascript)
to the question of clearing all cookies affecting the current web page.
