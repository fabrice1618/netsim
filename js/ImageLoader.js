function init() 
{
    var loader = new ImageLoader(
    ["img/64/switch.png", 
    "img/64/router2.png", 
    "img/64/computer.png", 
    "img/64/server_web.png", 
    "img/64/server_dns.png", 
    "img/64/server_dhcp.png", 
    "img/64/envelope-DHCP.png", 
    "img/64/envelope-DNS.png", 
    "img/64/envelope-HTTP.png",
    "img/64/envelope-ICMP.png"], 
    simulator
    );
    console.log('ImageLoader initialized with images');
    loader.load();
}