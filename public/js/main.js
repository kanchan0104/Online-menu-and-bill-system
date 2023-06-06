function getParameters() {
    let urlString = window.location.href;
    console.log(urlString);
    // alert(urlString);
    let paramString = urlString.split('?')[1];
    let params_arr = paramString.split('&');
    let pair = params_arr[0].split('=');
    // alert("Value is:" + pair[1]);
}
getParameters();

document.getElementById( 'arp' ).addEventListener( 'click', function () {
    // check for and report errors here
    document.querySelectorAll('arpform')[0].submit();
    document.querySelectorAll('arpform')[1].submit();
} );