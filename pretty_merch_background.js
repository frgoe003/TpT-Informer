moment.tz.setDefault("America/Los_Angeles");
var DB, debugMode = !1,
    showTestSales = !1,
    test_count = 0,
    marketplaces = {
        usa: {
            marketplace_id: "ATVPDKIKX0DER",
            country_name: "United States",
            country_code: "usa",
            country_code_official: "us",
            country_language: "English",
            country_language_code: "en",
            marketplace_extension: ".com",
            css_tag: "usa-mrkt",
            currency_symbol: "$",
            flag_img: "flag_USA_256_min.png"
        },
        uk: {
            marketplace_id: "A1F83G8C2ARO7P",
            country_name: "United Kingdom",
            country_code: "uk",
            country_code_official: "gb",
            country_language: "English",
            country_language_code: "en",
            marketplace_extension: ".co.uk",
            css_tag: "uk-mrkt",
            currency_symbol: "£",
            flag_img: "flag_UK_256_min.png"
        },
        ger: {
            marketplace_id: "A1PA6795UKMFR9",
            country_name: "Germany",
            country_code: "ger",
            country_code_official: "de",
            country_language: "German",
            country_language_code: "de",
            marketplace_extension: ".de",
            css_tag: "ger-mrkt",
            currency_symbol: "€",
            flag_img: "flag_DE_256_min.png"
        },
        fr: {
            marketplace_id: "A13V1IB3VIYZZH",
            country_name: "France",
            country_code: "fr",
            country_code_official: "fr",
            country_language: "French",
            country_language_code: "fr",
            marketplace_extension: ".fr",
            css_tag: "fr-mrkt",
            currency_symbol: "€",
            flag_img: "flag_FR_256_min.png"
        },
        it: {
            marketplace_id: "APJ6JRA9NG5V4",
            country_name: "Italy",
            country_code: "it",
            country_code_official: "it",
            country_language: "Italian",
            country_language_code: "it",
            marketplace_extension: ".it",
            css_tag: "it-mrkt",
            currency_symbol: "€",
            flag_img: "flag_IT_256_min.png"
        },
        es: {
            marketplace_id: "A1RKKUPIHCS9HS",
            country_name: "Spain",
            country_code: "es",
            country_code_official: "es",
            country_language: "Spanish",
            country_language_code: "es",
            marketplace_extension: ".es",
            css_tag: "es-mrkt",
            currency_symbol: "€",
            flag_img: "flag_ES_256_min.png"
        },
        jp: {
            marketplace_id: "A1VC38T7YXB528",
            country_name: "Japan",
            country_code: "jp",
            country_code_official: "jp",
            country_language: "Japanese",
            country_language_code: "jp",
            marketplace_extension: ".co.jp",
            css_tag: "jp-mrkt",
            currency_symbol: "¥",
            flag_img: "flag_JP_256_min.png"
        }
    },
    G_AMAZON_INTERNAL_FLAGS = {
        product_flags: {
            RAGLAN: "Raglan",
            VNECK: "V-neck T-shirt",
            ZIP_HOODIE: "Zip Hoodie",
            STANDARD_PULLOVER_HOODIE: "Pullover Hoodie",
            PREMIUM_TSHIRT: "Premium T-Shirt",
            STANDARD_SWEATSHIRT: "Sweatshirt",
            POP_SOCKET: "PopSockets",
            STANDARD_TSHIRT: "Standard T-Shirt",
            STANDARD_LONG_SLEEVE: "Long Sleeve T-Shirt",
            TANK_TOP: "Tank Top",
            CELL_PHONE_COVER: "Cell Phone Cover",
            ATHLETIC_SHIRT: "Athletic Shirt",
            TOTE_BAG: "Tote Bag",
            PHONE_CASE_APPLE_IPHONE: "Apple iPhone Case",
            PHONE_CASE_SAMSUNG_GALAXY: "Samsung Galaxy Case",
            DUVET_COVER: "Duvet Cover",
            THROW_BLANKET: "Throw Blanket",
            THROW_PILLOW: "Throw Pillow",
            SHOWER_CURTAIN: "Shower Curtain",
            BATH_MAT: "Bath Mat",
            PRINT: "Print",
            TAPESTRY: "Tapestry",
            MUG: "Mug",
            SOCKS: "Socks",
            HOUSE_BRAND: "Standard T-Shirt",
            PREMIUM_BRAND: "Premium T-Shirt"
        },
        status_flags: {
            DRAFT: "Draft",
            TRANSLATING: "Translating",
            REVIEW: "Under review",
            DECLINED: "Declined",
            AMAZON_REJECTED: "Rejected",
            PUBLISHING: "Processing",
            PUBLISHED: "Live",
            PROPAGATED: "Auto Uploaded",
            DELETING: "Removed",
            DELETED: "Removed",
            TIMED_OUT: "Timed Out",
            CONTENT_POLICY_VIOLATION: "Content Policy Violation",
            INACTIVE_NO_SALES: "No Sales",
            CONTENT_CREATOR: "Deleted by user"
        }
    },
    G_PRODUCT_TYPE_SORT_ORDER = ["Standard T-Shirt", "Premium T-Shirt", "V-neck T-shirt", "Tank Top", "Long Sleeve T-Shirt", "Raglan", "Sweatshirt", "Pullover Hoodie", "Zip Hoodie", "PopSockets", "Apple iPhone Case", "Samsung Galaxy Case", "Tote Bag", "Duvet Cover", "Throw Blanket", "Throw Pillow", "Shower Curtain", "Bath Mat", "Print", "Tapestry", "Mug", "Socks"],
    G_OFFICIAL_BRANDS = ["Visit the", "Paramount Network", "Bratz", "Squid Game", "PopSockets", "Jurassic Park", "Rolling Stones", "ScoobyDoo", "Scooby Doo", "Scooby-Doo", "Pinkfong", "SpongeBob", "DC Comics", "Justice League", "Superman", "Batman", "SANRIO", "Peanuts", "Nickelodeon", "Urban Species", "Looney Tunes", "AC/DC", "The Beatles", "SUPER MARIO", "KISS", "RICK AND MORTY", "Misfits", "The Expanse", "Supernatural", "Despicable Me", "JEFF DUNHAM", "Mr. Men Little Miss", "Poison Band", "Spice Girls Official", "Atari", "Sonic The Hedgehog", "Cartoon Network", "Pixar", "Battlestar Galactica", "Wham!", "Dr. Seuss", "Hello Kitty", "Billie Eilish", "Bravado", "Warner Bros.", "Marvel", "FC Bayern München", "Warner Bros", "Dolly Parton", "Netflix", "MTV", "Kiss", "Iron Maiden Official", "Ann Arbor T-shirt Co.", "Coca-Cola", "Barbie", "Nasa", "Disney", "Kiss", "CafePress", "Pusheen the cat", "Ghostbusters", "Star Wars", "Star Trek", "Cypress Hill", "Grumpy Cat", "KSS", "John Lennon", "Ann Arbor T - shirt Co.Urban Species", "Coca - Cola", "Guns N Roses", "Nukular", "ZIGGY MARLEY", "Rise Against", "Gypsy Queen", "Corona", "Architects", "Trevco", "Dirty Dancing", "Descendents", "IMC", "Jimmy Hendrix", "Boom", "Jimbeels", "Emily the Strange", "ALBASPIRIT", "AC / DC", "Dropkick Murphys", "David Bowie", "Justin Bieber", "Nbc", "DoodleTogs", "Biene Maja", "FOXY APPAREL", "Mia and Me", "Slipknot", "Winx", "The Grand Tour", "American Football", "Black Sabbath", "Overwatch", "Aerosmith", "I Prevail", "Newcastle United", "Dolce & Gabbana", "Angry Birds", "Call of Duty", "Mascha und der Bär", "Polly Pocket", "ArtAttack Shirts & Tees", "BUDO", "Frank Turner", "Green Day", "Universal", "Behemoth", "Budweiser", "Nici", "Care Bears", "Design By Humans", "Manchester City F.C.Ames Bros", "Dr.Seuss", "buXsbaum", "Artist Shirts Co.Teletubbies", "Feuerwehrmann Sam", "Humor", "Hot Wheels", "The Rolling Stones", "Sonic the Hedgehog", "Gold Label", "H2O", "LCG", "30th Birthday Tees NYC", "Panic At The Disco", "Bring Me The Horizon", "Lustiges Shirt", "Blue Level", "PaPa T - Shirt", "Bull & Bear", "Novel - Tees", "Mom Love", "Whitney Houston", "Woodstock", "KODAK", "DOTA", "Goose Island", "Portal", "Pilot", "Bruce Lee", "SLEEPSUPPLY", "Fear the Walking Dead", "Autism Awareness Shirts", "Sega", "Bow And Arrow", "Nylon", "WWE", "Mr Bean", "Willie Nelson", "Ripple Junction", "Auftragsgriller", "World of Warcraft", "SyFy", "Bright Side", "Shirt - o - Topia", "Kingfisher", "Nordic Walking", "Not Guilty", "Tee Luv", "Bookrebels", "Death row records", "Nika Bee Apparel", "SUBWAY SURFERS", "The Princess Bride", "The Smurfs", "Bathory", "Beekeeping Shirts Co.Book Lovers Unite 6000", "Bud Light", "Carolina", "DOTS", "Einhorn", "Engel", "Falling In Reverse", "Galaxy", "Ghost", "Hybrid", "INNOGLEN", "Inspector Gadget", "Precious Moments", "XO4U", "The Golden Girls", "Cobra Kai", "BTS", "Harry Potter", "Amazon Essentials", "Queen", "Roblox", "Pink Floyd", "TUPAC SHAKUR", "Nintendo", "Jurassic Park", "Death Row Records", "Gabby's Dollhouse", "Mademark", "The Big Lebowski", "Peanuts", "Ted Lasso", "Teenage Mutant Ninja Turtles", "Eminem", "Tupac", "Guess", "Naruto", "Visit the Jeep", "Fortnite", "Visit the LOL", "Disney", "Amazon.com", "PACMAN", "Minecraft", "ジュラシック・パーク", "Godzilla vs Kong", "Aaliyah", "Guns N’ Roses", "Bob Marley", "Jeep", "Foo Fighters", "Jackass", "Korn", "Top Gun", "Backstreet Boys", "Breaking Bad", "Stranger Things", "Elvis Presley", "Dungeons & Dragons", "Legend of Zelda", "Boyz In The Hood", "Jurassic World", "Britney Spears", "Machine Gun Kelly", "Brooks Store", "Space Jam", "Mademark", "My Melody", "Gudetama", "Pompompurin", "Little Twin Stars", "Pochacco", "Cinnamoroll", "Keroppi"],
    xml_success_responsees = [200, 201, 202, 203, 204, 205, 206, 207, 226],
    G_DESIGNER_ID = !1,
    G_IS_PRO = !1,
    G_PRO_PLAN = "free",
    G_AUTOLOGIN_TAB = !1,
    G_ATTEMPT_AUTO_RE_LOGIN = !0,
    G_COUNT_LOGIN_ATTEMPTS = 0,
    G_ARL_LOGGED_OUT_MSG = "",
    G_EXTENSION_VERSION = chrome.runtime.getManifest().version,
    alarmOpts = {
        delayInMinutes: 1,
        periodInMinutes: 1
    },
    beginning_of_time = moment("2015-09-01").startOf("day"),
    loggedIn = !0,
    checkingLogIn = !1,
    gettingProductsList = !1,
    G_IS_UPDATING_PRODUCT_META_DATA = !1,
    G_FORCE_STOP_UPDATING_PRODUCT_META_DATA = !1,
    welcomeNotification = !1,
    loggedOutNotification = !1,
    newSaleNotification = !1,
    showLogoutNotification = !0,
    force_gDesignerId_refresh = !1,
    sales_sound = document.createElement("audio"),
    loggout_out_sound = document.createElement("audio"),
    opt_showLogoutNotif = !0,
    opt_showSalesNotif = !0,
    opt_tax_rate = 0,
    OPT_AUTO_RE_LOGIN = !1,
    OPT_AUTO_RE_LOGIN_EMAIL = "",
    OPT_AUTO_RE_LOGIN_PASSWORD = "",
    G_PRODUCT_LIST = {},
    G_PRODUCT_LIST_DEFAULT_PROGRESS_CONTAINER = ".manage-products-table-container",
    G_PRODUCT_COUNT = {},
    logged_in_user = "tmp_user",
    selected_marketplace = marketplaces.usa,
    doingInitMain = !0;

function initMain(t) {
    doingInitMain = !0, chrome.storage.local.get("app_data", (function(e) {
        void 0 !== e.app_data && "" != e.app_data && (logged_in_user = e.app_data.s_id), initCommon((function() {
            fetchOptions((function() {
                doingInitMain = !1, "function" == typeof t && t()
            }))
        }))
    }))
}

function waitForinitMain(t) {
    if (doingInitMain) {
        var e = setTimeout((function t() {
            doingInitMain ? e = setTimeout(t, 300) : (clearTimeout(e), a())
        }), 50)
    } else a();

    function a() {
        "function" == typeof t && t()
    }
}
async function initDB(t) {
    (DB = new Dexie("prettymerch_" + logged_in_user)).version(1).stores({
        products: "&listingId, asin, marketplace, productType, productTitle, status, listPrice, updatedDate, createdDate, estimatedExpirationDate, [productType+listingId], [status+listingId], [listPrice+listingId], [updatedDate+listingId], [createdDate+listingId], [estimatedExpirationDate+listingId]",
        app_data: "&title"
    }), DB.version(2).stores({
        products: "&listingId, asin, marketplace, productType, productTitle, status, listPrice, updatedDate, createdDate, estimatedExpirationDate, [productType+listingId], [status+listingId], [listPrice+listingId], [updatedDate+listingId], [createdDate+listingId], [estimatedExpirationDate+listingId]",
        app_data: "&title",
        sales: "&sale_date"
    }), DB.version(3).stores({
        products: "&listingId, designId, asin, marketplace, productType, productTitle, status, listPrice, updatedDate, createdDate, estimatedExpirationDate, pm_data.sales.has_sales, pm_data.sales.date_of_last_sale, [productType+listingId], [status+listingId], [listPrice+listingId], [updatedDate+listingId], [createdDate+listingId], [estimatedExpirationDate+listingId], [pm_data.reviews.needs_review_update+pm_data.sales.date_of_last_sale], [pm_data.product_texts.needs_update+updatedDate]",
        app_data: "&title",
        sales: "&sale_date"
    }), DB.version(4).stores({
        products: "&listingId, designId, asin, marketplace, productType, productTitle, status, listPrice, updatedDate, createdDate, estimatedExpirationDate, pm_data.status, pm_data.product_type, pm_data.sales.has_sales, pm_data.sales.total_net_sold, pm_data.sales.date_of_last_sale, pm_data.sales.total_royalties, pm_data.reviews.num_of_reviews, pm_data.reviews.review_score, pm_data.bsr.bsr_val_clean, pm_data.date_of_last_listing_scrape, pm_data.availability.buyable, pm_data.availability.reason,[productType+listingId], [status+listingId], [listPrice+listingId], [updatedDate+listingId], [createdDate+listingId], [estimatedExpirationDate+listingId], [pm_data.reviews.needs_review_update+pm_data.sales.date_of_last_sale], [pm_data.product_texts.needs_update+updatedDate]",
        app_data: "&title",
        sales: "&sale_date"
    }), t()
}

function checkDesignerId(t) {
    G_DESIGNER_ID ? t() : getDesignerId((function(e) {
        t()
    }))
}

function getDesignerId(t) {
    if (loggedIn) {
        G_DESIGNER_ID.successfully_fetched = !1;
        var e = logged_in_user + btoa("_designerId");
        chrome.storage.sync.get(e, (function(t) {
            if (void 0 === t[e] || force_gDesignerId_refresh) {
                force_gDesignerId_refresh = !1, (G_DESIGNER_ID = {}).customerId = "", G_DESIGNER_ID.accountId = "", G_DESIGNER_ID.successfully_fetched = !1;
                var r = new XMLHttpRequest;
                r.open("GET", "https://merch.amazon.com/dashboard", !0), r.onreadystatechange = function() {
                    if (4 == r.readyState) {
                        if (-1 === xml_success_responsees.indexOf(r.status));
                        else if (-1 != r.responseText.indexOf("AuthenticationPortal"));
                        else {
                            var t = r.responseText,
                                s = "",
                                o = "";
                            try {
                                s = /"customerId":"([A-Za-z0-9]*)"/g.exec(t)[1];
                                o = /"accountId":"([A-Za-z0-9]*)"/g.exec(t)[1]
                            } catch (t) {}
                            if (G_DESIGNER_ID.customerId = s, G_DESIGNER_ID.accountId = o, G_DESIGNER_ID.successfully_fetched = !0, logged_in_user) {
                                var n = {};
                                n[e] = G_DESIGNER_ID, chrome.storage.sync.set(n)
                            }
                        }
                        a()
                    }
                }, r.send()
            } else G_DESIGNER_ID = t[e], a()
        }))
    } else a();

    function a() {
        t()
    }
}

function fetchOptions(t) {
    var e = logged_in_user + "_options";
    chrome.storage.sync.get(e, (function(a) {
        if (void 0 !== a[e]) opt_showLogoutNotif = a[e].show_logout_notif, opt_showSalesNotif = a[e].show_sales_notif, "no_sound" == a[e].sales_notif_sound ? sales_sound = !1 : sales_sound.src = chrome.extension.getURL("/assets/mp3/" + a[e].sales_notif_sound + ".mp3"), "no_sound" == a[e].logout_notif_sound ? loggout_out_sound = !1 : loggout_out_sound.src = chrome.extension.getURL("/assets/mp3/" + a[e].logout_notif_sound + ".mp3"), opt_tax_rate = a[e].tax_rate ? a[e].tax_rate : 0, OPT_AUTO_RE_LOGIN = !!a[e].auto_re_login && a[e].auto_re_login.is_enabled, OPT_AUTO_RE_LOGIN_EMAIL = a[e].auto_re_login ? atob(a[e].auto_re_login.arl_email) : "", OPT_AUTO_RE_LOGIN_PASSWORD = a[e].auto_re_login ? atob(a[e].auto_re_login.arl_password) : "";
        else {
            saveOptions({
                show_sales_notif: !0,
                sales_notif_sound: "cha-ching-1",
                show_logout_notif: !0,
                logout_notif_sound: "attention-6",
                tax_rate: 0,
                auto_re_login: {
                    is_enabled: !1,
                    arl_email: "",
                    arl_password: ""
                }
            })
        }
        "function" == typeof t && t()
    }))
}

function saveOptions(t) {
    if (opt_showLogoutNotif = t.show_logout_notif, opt_showSalesNotif = t.show_sales_notif, "no_sound" == t.sales_notif_sound ? sales_sound = !1 : sales_sound.src = chrome.extension.getURL("/assets/mp3/" + t.sales_notif_sound + ".mp3"), "no_sound" == t.logout_notif_sound ? loggout_out_sound = !1 : loggout_out_sound.src = chrome.extension.getURL("/assets/mp3/" + t.logout_notif_sound + ".mp3"), opt_tax_rate = t.tax_rate ? t.tax_rate : 0, OPT_AUTO_RE_LOGIN = !!t.auto_re_login && t.auto_re_login.is_enabled, OPT_AUTO_RE_LOGIN_EMAIL = t.auto_re_login ? atob(t.auto_re_login.arl_email) : "", OPT_AUTO_RE_LOGIN_PASSWORD = t.auto_re_login ? atob(t.auto_re_login.arl_password) : "", logged_in_user) {
        var e = {};
        e[logged_in_user + "_options"] = t, chrome.storage.sync.set(e, (function() {}))
    }
}

function isInt(t) {
    return !isNaN(t) && parseInt(Number(t)) == t && !isNaN(parseInt(t, 10))
}

function checkLicence(t, e) {
    var a = moment().startOf("day").valueOf(),
        r = "",
        s = "",
        o = !1,
        n = logged_in_user + btoa("_licence"),
        i = logged_in_user + btoa("_lastVerifyUser"),
        l = logged_in_user + "_currentTier";

    function c() {
        if (o && logged_in_user && "tmp_user" != logged_in_user) {
            verifyLicence(logged_in_user, r, G_IS_PRO, G_PRO_PLAN, l);
            var t = {
                    date: moment().startOf("day").valueOf()
                },
                a = {};
            a[i] = t, chrome.storage.sync.set(a)
        }
        "function" == typeof e && e()
    }
    chrome.storage.sync.get([n, i, l], (function(e) {
        (l = void 0 !== e[l] && e[l].hasOwnProperty("tier") ? e[l].tier : "", void 0 !== e[n]) ? (r = e[n]?.ul ? atob(e[n].ul) : "", s = e[n]?.iv ? atob(e[n].iv) : "", e[n]?.lm ? atob(e[n].lm) : "", G_IS_PRO = "true" === s, G_PRO_PLAN = e[n].hasOwnProperty("pl") ? atob(e[n].pl) : "free", !t && void 0 !== e[i] && e[i].hasOwnProperty("date") && e[i].date == a ? c() : validateLicence({
            usr: logged_in_user,
            licence: r
        }, (function(t) {
            if (t) {
                G_IS_PRO = !(!t.isValid || !t.pm_plan?.includes("pro")), G_PRO_PLAN = t.pm_plan;
                var e = {
                    ul: t.active_licence ? btoa(t.active_licence) : btoa(r),
                    iv: btoa(t.isValid),
                    pl: btoa(t.pm_plan),
                    cd: btoa(t.subscription_cancelled_at),
                    fd: btoa(t.subscription_failed_at),
                    lm: btoa(t.msg)
                };
                if (logged_in_user) {
                    var a = {};
                    a[n] = e, chrome.storage.sync.set(a)
                }
                o = !0
            }
            c()
        }))) : (G_IS_PRO = !1, G_PRO_PLAN = "free", void 0 !== e[i] && !t && e[i].hasOwnProperty("date") && e[i].date == a || (o = !0), c())
    }))
}

function handleLogIn(t) {
    logged_in_user = t, force_gDesignerId_refresh = !0;
    var e = {
        s_id: t
    };
    if (chrome.storage.local.set({
            app_data: e
        }), G_AUTOLOGIN_TAB);
    else {
        selected_marketplace = marketplaces.usa;
        var a = {};
        a[logged_in_user + "_selectedMarketplace"] = "usa", chrome.storage.local.set(a)
    }++G_COUNT_LOGIN_ATTEMPTS, fetchOptions(), checkLicence(!0)
}

function doCheckLoginFallback() {
    chrome.tabs.onUpdated.removeListener(autoReLoginListener), chrome.storage.local.get("arl_data", (function(t) {
        void 0 !== t.arl_data && "" != t.arl_data && (G_AUTOLOGIN_TAB = t.arl_data.arl_tab_id), chrome.tabs.remove(G_AUTOLOGIN_TAB, (function() {
            chrome.storage.local.remove("arl_data", (function() {}))
        })), G_AUTOLOGIN_TAB = !1, G_ATTEMPT_AUTO_RE_LOGIN = !1, G_ARL_LOGGED_OUT_MSG = "Auto Re-Login couldn't log you back in. The login attempt timed out", checkLogIn()
    }))
}

function triggerAutoReLogin() {
    G_AUTOLOGIN_TAB || (G_AUTOLOGIN_TAB = !0, chrome.alarms.clearAll(), chrome.tabs.onUpdated.removeListener(autoReLoginListener), setTimeout((function() {
        chrome.tabs.onUpdated.addListener(autoReLoginListener), chrome.tabs.create({
            active: !1,
            pinned: !0
        }, (function(t) {
            var e = {
                arl_tab_id: G_AUTOLOGIN_TAB = t.id
            };
            chrome.storage.local.set({
                arl_data: e
            }, (function() {
                chrome.tabs.update(G_AUTOLOGIN_TAB, {
                    url: "https://merch.amazon.com/dashboard?autoReLogin",
                    autoDiscardable: !1
                }, (function(t) {}))
            }))
        })), chrome.alarms.create("doCheckLoginFallback", {
            delayInMinutes: 1
        })
    }), 500))
}

function handleLogOut() {
    if (loggedIn)
        if (G_IS_PRO && OPT_AUTO_RE_LOGIN && G_ATTEMPT_AUTO_RE_LOGIN) triggerAutoReLogin();
        else {
            loggedIn = !1, chrome.alarms.clearAll((function(t) {})), updateTabs({
                update: "loggedOut",
                msg: G_ARL_LOGGED_OUT_MSG
            });
            var t = {
                type: "basic",
                isClickable: !0,
                requireInteraction: !1,
                title: "You are signed out of Merch by Amazon",
                message: "Sign in to get updates on your sales",
                iconUrl: chrome.extension.getURL("/assets/img/notificationLogo.png"),
                buttons: [{
                    title: "Sign in to Merch by Amazon",
                    iconUrl: chrome.extension.getURL("/assets/img/sign-in-icon.png")
                }, {
                    title: "Close",
                    iconUrl: chrome.extension.getURL("/assets/img/close-icon.png")
                }]
            };
            opt_showLogoutNotif && showLogoutNotification && !loggedOutNotification && !welcomeNotification && (loggedOutNotification = !0, chrome.notifications.create(t, (function(t) {
                loggedOutNotification = t, loggout_out_sound && loggout_out_sound.play()
            }))), showLogoutNotification = !1, setBrowserIcons("inactive")
        }
}

function forceLogout(t) {
    var e = "https://merch.amazon.com/api/auth/logout/url";

    function a() {
        "function" == typeof t && t()
    }! function t(r) {
        var s = new XMLHttpRequest,
            o = r;
        s.open("GET", o, !0), s.onreadystatechange = function() {
            4 == s.readyState && (-1 === xml_success_responsees.indexOf(s.status) || (-1 != s.responseText.indexOf("AuthenticationPortal") ? a() : r == e ? t(s.responseText) : a()))
        }, s.send()
    }(e)
}

function checkLogIn(t) {
    if (loggedIn && !checkingLogIn) {
        loggedIn = !0, checkingLogIn = !0;
        var e = !0;
        force_gDesignerId_refresh = !0, getDesignerId((function(t) {
            if (G_DESIGNER_ID.successfully_fetched) a(e);
            else {
                var r = new XMLHttpRequest;
                r.open("GET", "https://merch.amazon.com/dashboard", !0), r.onreadystatechange = function() {
                    4 == r.readyState && (-1 === xml_success_responsees.indexOf(r.status) ? (loggedIn = !1, e = !1, chrome.alarms.clearAll((function(t) {
                        chrome.alarms.create("retryCheckLogin", {
                            delayInMinutes: 1
                        })
                    }))) : -1 != r.responseText.indexOf("AuthenticationPortal") && (e = !1, handleLogOut()), a(e))
                }, setTimeout((function() {
                    r.send()
                }), 5e3)
            }
        }))
    }

    function a(e) {
        checkingLogIn = !1, "function" == typeof t && t(e)
    }
}

function retryCheckLogin() {
    checkLogIn((function(t) {
        t && checkAlarms()
    }))
}

function doMiscTasks(t) {
    t = t || 0, waitForinitMain((function() {
        setTimeout((function() {
            findOpenTabs((function(t) {
                t.length > 0 && (getAmazonMessages(), getUserEarnings(2500))
            }))
        }), t)
    }))
}

function getAmazonMessages(t) {
    if (loggedIn) {
        t = t || 0;
        var e = new XMLHttpRequest;
        e.open("GET", "https://merch.amazon.com/api/topic/GG6UN53EZ98W9CM", !0), e.setRequestHeader("PrettyMerch", "true"), e.onreadystatechange = function() {
            if (4 == e.readyState)
                if (-1 === xml_success_responsees.indexOf(e.status)) checkLogIn();
                else if (-1 != e.responseText.indexOf("AuthenticationPortal")) checkLogIn();
            else {
                var t = "",
                    a = "";
                try {
                    t = JSON.parse(e.responseText);
                    a = $.parseHTML(t.content)
                } catch (t) {}
                if (a) {
                    var r = $("<div></div>");
                    r.html(a[0].outerHTML);
                    var s = r.find("li:first p").html(),
                        o = r.find("li:first h6").html();
                    if (s) {
                        var n = {},
                            i = logged_in_user + "_latestAmzMessage";
                        chrome.storage.sync.get(i, (function(t) {
                            if (void 0 !== t[i] && "" != t[i]) {
                                if (t[i].msg == s);
                                else {
                                    var e = {
                                        msg: s,
                                        date: o
                                    };
                                    logged_in_user && ((n = {})[i] = e, chrome.storage.sync.set(n)), updateTabs({
                                        update: "showAmzMessage",
                                        data: e
                                    })
                                }
                            } else {
                                e = {
                                    msg: s,
                                    date: o
                                };
                                logged_in_user && ((n = {})[i] = e, chrome.storage.sync.set(n))
                            }
                        }))
                    }
                }
            }
        }, setTimeout((function() {
            e.send()
        }), t)
    }
}

function getUserEarnings(t) {
    if (loggedIn) {
        t = t || 0;
        var e = "https://merch.amazon.com/api/reporting/earnings/summary?";
        Object.keys(marketplaces).forEach((function(t) {
            e += "marketplaceId=" + marketplaces[t].marketplace_id + "&"
        }));
        var a = new XMLHttpRequest;
        a.open("GET", e, !0), a.setRequestHeader("PrettyMerch", "true"), a.onreadystatechange = function() {
            if (4 == a.readyState)
                if (-1 === xml_success_responsees.indexOf(a.status)) checkLogIn();
                else if (-1 != a.responseText.indexOf("AuthenticationPortal")) checkLogIn();
            else {
                var t = "";
                try {
                    t = JSON.parse(a.responseText)
                } catch (t) {}
                var e = "";
                if (Object.keys(t).forEach((function(a) {
                        "" == e && (e = moment(t[a].timePeriod.startTime).format("MMMM YYYY")), Object.keys(marketplaces).forEach((function(e) {
                            a == marketplaces[e].marketplace_id && (t[a].country_name = marketplaces[e].country_name, t[a].currencySymbol = marketplaces[e].currency_symbol, t[a].flag_img = marketplaces[e].flag_img)
                        }))
                    })), e) {
                    var r = {},
                        s = logged_in_user + "_latestEarnings";
                    chrome.storage.sync.get(s, (function(a) {
                        if (void 0 !== a[s] && "" != a[s]) {
                            if (a[s].date == e);
                            else {
                                var o = {
                                    date: e,
                                    earnings: t
                                };
                                logged_in_user && ((r = {})[s] = o, chrome.storage.sync.set(r)), updateTabs({
                                    update: "showLatestEarnings",
                                    data: o
                                })
                            }
                        } else {
                            o = {
                                date: e,
                                earnings: t
                            };
                            logged_in_user && ((r = {})[s] = o, chrome.storage.sync.set(r))
                        }
                    }))
                }
            }
        }, setTimeout((function() {
            a.send()
        }), t)
    }
}

function getPublishedItemsSummary() {
    if (loggedIn) {
        var t = {};
        checkDesignerId((function(e) {
            var a = new XMLHttpRequest;
            a.open("GET", "https://merch.amazon.com/api/ratelimiter/metadata", !0), a.setRequestHeader("PrettyMerch", "true"), a.onreadystatechange = function() {
                if (4 == a.readyState)
                    if (-1 === xml_success_responsees.indexOf(a.status)) checkLogIn();
                    else if (-1 != a.responseText.indexOf("AuthenticationPortal"));
                else {
                    var e = "";
                    try {
                        e = JSON.parse(a.responseText)
                    } catch (t) {}
                    if (e) {
                        t.dailyUpload = {}, t.totalDesign = {}, t.totalProduct = {}, t.dailyUpload.count = e.dailyProduct.count, t.dailyUpload.limit = e.dailyProduct.limit, t.dailyUpload.percent = e.dailyProduct.count / e.dailyProduct.limit * 100, t.totalDesign.count = e.overallDesign.count, t.totalDesign.limit = e.overallDesign.limit, t.totalDesign.percent = t.totalDesign.count / t.totalDesign.limit * 100, t.totalProduct.count = e.overallProduct.count, t.totalProduct.limit = e.overallProduct.limit, t.totalProduct.percent = t.totalProduct.count / t.totalProduct.limit * 100;
                        moment().startOf("day").valueOf();
                        var r = {},
                            s = logged_in_user + "_currentTier";
                        chrome.storage.sync.get([s], (function(e) {
                            var a, o, n = [{
                                tier_limit: 10,
                                tier_name: "Rookie",
                                tier_img: chrome.extension.getURL("/assets/img/tier10.png")
                            }, {
                                tier_limit: 25,
                                tier_name: "Just Warming Up",
                                tier_img: chrome.extension.getURL("/assets/img/tier25.png")
                            }, {
                                tier_limit: 100,
                                tier_name: "Raw Skills",
                                tier_img: chrome.extension.getURL("/assets/img/tier100.png")
                            }, {
                                tier_limit: 500,
                                tier_name: "Let's Rock",
                                tier_img: chrome.extension.getURL("/assets/img/tier500.png")
                            }, {
                                tier_limit: 1e3,
                                tier_name: "Graphic Genius",
                                tier_img: chrome.extension.getURL("/assets/img/tier1000.png")
                            }, {
                                tier_limit: 2e3,
                                tier_name: "Veteran",
                                tier_img: chrome.extension.getURL("/assets/img/tier2000.png")
                            }, {
                                tier_limit: 4e3,
                                tier_name: "Total Charisma",
                                tier_img: chrome.extension.getURL("/assets/img/tier4000.png")
                            }, {
                                tier_limit: 6e3,
                                tier_name: "Extreme",
                                tier_img: chrome.extension.getURL("/assets/img/tier6000.png")
                            }, {
                                tier_limit: 8e3,
                                tier_name: "Elite",
                                tier_img: chrome.extension.getURL("/assets/img/tier8000.png")
                            }, {
                                tier_limit: 1e4,
                                tier_name: "Trend Setter",
                                tier_img: chrome.extension.getURL("/assets/img/tier10000.png")
                            }, {
                                tier_limit: 12e3,
                                tier_name: "Heroic",
                                tier_img: chrome.extension.getURL("/assets/img/tier12000.png")
                            }, {
                                tier_limit: 14e3,
                                tier_name: "Legendary",
                                tier_img: chrome.extension.getURL("/assets/img/tier14000.png")
                            }, {
                                tier_limit: 16e3,
                                tier_name: "Super-Human",
                                tier_img: chrome.extension.getURL("/assets/img/tier16000.png")
                            }, {
                                tier_limit: 2e4,
                                tier_name: "Unicorn Squad",
                                tier_img: chrome.extension.getURL("/assets/img/tier20000.png")
                            }, {
                                tier_limit: 22e3,
                                tier_name: "Merch Visionary",
                                tier_img: chrome.extension.getURL("/assets/img/tier22000.png")
                            }, {
                                tier_limit: 24e3,
                                tier_name: "Mythical Designer",
                                tier_img: chrome.extension.getURL("/assets/img/tier24000.png")
                            }, {
                                tier_limit: 26e3,
                                tier_name: "Out Of This World",
                                tier_img: chrome.extension.getURL("/assets/img/tier26000.png")
                            }, {
                                tier_limit: 1e5,
                                tier_name: "Golden Unicorn",
                                tier_img: chrome.extension.getURL("/assets/img/tier100000.png")
                            }, {
                                tier_limit: 2e5,
                                tier_name: "Merch Dragon",
                                tier_img: chrome.extension.getURL("/assets/img/tier200000.png")
                            }, {
                                tier_limit: 3e5,
                                tier_name: "Merch Dragon",
                                tier_img: chrome.extension.getURL("/assets/img/tier300000.png")
                            }];
                            t.tier_number = t.totalDesign.limit;
                            for (var i = 0; i < n.length; ++i) t.tier_number >= n[i].tier_limit && (a = n[i].tier_name, o = n[i].tier_img);
                            if (t.tier_name = a, t.tier_img = o, t.totalProductWithSales = G_PRODUCT_COUNT.has_sales && G_PRODUCT_COUNT.has_sales.hasOwnProperty("true") ? G_PRODUCT_COUNT.has_sales.true : 0, t.buyableProducts = G_PRODUCT_COUNT.is_buyable && G_PRODUCT_COUNT.is_buyable.hasOwnProperty("true") ? G_PRODUCT_COUNT.is_buyable.true : 0, t.productsWithReviews = G_PRODUCT_COUNT.has_reviews && G_PRODUCT_COUNT.has_reviews.hasOwnProperty("true") ? G_PRODUCT_COUNT.has_reviews.true : 0, t.totalReviews = G_PRODUCT_COUNT.has_reviews && G_PRODUCT_COUNT.has_reviews.hasOwnProperty("total_review_count") ? G_PRODUCT_COUNT.has_reviews.total_review_count : 0, t.totalReviewScore = G_PRODUCT_COUNT.has_reviews && G_PRODUCT_COUNT.has_reviews.hasOwnProperty("total_review_score") ? G_PRODUCT_COUNT.has_reviews.total_review_score : 0, updateTabs({
                                    update: "publishedItemsSummary",
                                    data: t
                                }), void 0 !== e[s] && "" != e[s]) {
                                var l = e[s].tier;
                                if (t.tier_number > l) {
                                    var c = {
                                        tier: t.tier_number
                                    };
                                    logged_in_user && ((r = {})[s] = c, chrome.storage.sync.set(r)), updateTabs({
                                        update: "showTierUpModal",
                                        data: {
                                            tier: t.tier_number,
                                            old_tier: parseInt(l),
                                            tier_img: o,
                                            tier_name: a
                                        }
                                    })
                                }
                            } else {
                                c = {
                                    tier: t.tier_number
                                };
                                logged_in_user && ((r = {})[s] = c, chrome.storage.sync.set(r))
                            }
                        }))
                    }
                }
            }, a.send()
        }))
    }
}

function getProcessingItems() {
    if (loggedIn) {
        var t = {},
            e = '{ "accountId": "' + G_DESIGNER_ID.accountId + '",  "pageSize": 500,  "pageToken": [],  "status": ["REVIEW","AMAZON_REJECTED","PUBLISHING"],  "__type": "com.amazon.merch.search#FindListingsRequest" }',
            a = 0,
            r = 0,
            s = 0,
            o = [],
            n = 1;
        ! function l() {
            o = new XMLHttpRequest, "https://merch.amazon.com/api/ng-amazon/coral/com.amazon.merch.search.MerchSearchService/FindListings", o.open("POST", "https://merch.amazon.com/api/ng-amazon/coral/com.amazon.merch.search.MerchSearchService/FindListings", !0), o.onreadystatechange = function() {
                if (4 == o.readyState) {
                    if (-1 === xml_success_responsees.indexOf(o.status) || o.responseURL.includes("/429")) return n >= 5 ? checkLogIn() : (++n, setTimeout((() => {
                        l()
                    }), 5e3)), !1;
                    if (-1 != o.responseText.indexOf("AuthenticationPortal")) checkLogIn();
                    else {
                        var e = "";
                        let n = !0;
                        try {
                            n = !!(e = JSON.parse(o.responseText))?.results
                        } catch (t) {
                            n = !1
                        }
                        if (n) {
                            var c = e.results;
                            for (i = 0; i < c.length; i++) {
                                var _ = c[i];
                                "REVIEW" == _.status && ++a, "PUBLISHING" == _.status && ++r, "AMAZON_REJECTED" == _.status && ++s
                            }
                            t.total_under_review = a, t.total_processing = r, t.total_rejected = s, updateTabs({
                                update: "processingItemsSummary",
                                data: t
                            })
                        }
                    }
                }
            }, o.send(e)
        }()
    }
}

function getTodaysSales(t, e) {
    t = t || 0, waitForinitMain((function() {
        if (loggedIn) {
            var t = moment().startOf("day").valueOf(),
                a = t,
                r = t;
            showTestSales && (a = moment(t).subtract(test_count, "days").startOf("day").valueOf(), ++test_count);
            var s = moment(a).format("M/D/YY"),
                o = ".sales-summary.today",
                n = 0,
                i = 0,
                l = 0,
                c = [];
            updateTabs({
                toggleLoaderDiv: !0,
                container: o,
                action: "show"
            }), fetchRawSalesData(a, r, ["all"], (function(_) {
                processRawSalesData(a, r, _, (function(a) {
                    a.result_container = o, a.title_date = s, Object.keys(marketplaces).forEach((function(r) {
                        if (a.hasOwnProperty(r)) {
                            ++n;
                            var s, o, _, d, u = {};
                            u.currency_symbol = a[r].marketplace_info.currency_symbol, u.total_sales = a[r].market_totals.total_sold, u.total_returned = a[r].market_totals.total_returned, u.total_cancelled = a[r].market_totals.total_cancelled, u.net_sales = a[r].market_totals.net_sales, u.total_revenue = a[r].market_totals.total_revenue.toFixed(2), u.total_royalties = a[r].market_totals.total_royalties.toFixed(2), l += u.net_sales;
                            var p, m = [],
                                f = logged_in_user + "_salesSummaryToday_" + r;
                            chrome.storage.local.get(f, (function(g) {
                                void 0 !== g[f] && "" != g[f] ? t > g[f].lastUpdate ? (0, s = 0, o = 0, _ = 0, m = []) : (g[f].net_sales, s = g[f].total_sales, o = g[f].total_cancelled, _ = g[f].total_returned, m = g[f].sales_list) : (0, s = 0, o = 0, _ = 0, m = []), s = u.total_sales - s, o = u.total_cancelled - o, _ = u.total_returned - _, d = 0;
                                var h = {},
                                    y = [],
                                    v = [],
                                    T = [],
                                    O = !1,
                                    D = 0,
                                    b = 0;
                                if (0 != s || 0 != o || 0 != _) {
                                    if (a[r].product_list.forEach((function(t) {
                                            if (h = JSON.parse(JSON.stringify(t)), h.net_sold > 0 || h.unitsReturned > 0) {
                                                O = !1;
                                                for (var e = 0; e < m.length; ++e) h.asin == m[e].asin && (h.net_sold > m[e].net_sold ? (h.sold_order = u.net_sales, h.net_just_sold = h.net_sold - m[e].net_sold, T[b] = JSON.parse(JSON.stringify(h)), c.push(JSON.parse(JSON.stringify(h))), d += T[b].net_just_sold, ++b) : h.unitsReturned > m[e].unitsReturned ? (h.sold_order = u.net_sales, h.net_just_returned = h.unitsReturned - m[e].unitsReturned) : h.sold_order = m[e].sold_order, O = !0, e = m.length);
                                                O || (h.sold_order = u.net_sales, h.net_sold > 0 ? (h.net_just_sold = h.net_sold, T[b] = JSON.parse(JSON.stringify(h)), c.push(JSON.parse(JSON.stringify(h))), d += T[b].net_just_sold, ++b) : h.unitsReturned > 0 && (h.net_just_returned = h.unitsReturned)), y[D] = JSON.parse(JSON.stringify(h)), ++D
                                            }
                                        })), i += d, v = y.sort((function(t, e) {
                                            return e.sold_order - t.sold_order
                                        })), p = {
                                            lastUpdate: t,
                                            net_sales: u.net_sales,
                                            total_sales: u.total_sales,
                                            total_cancelled: u.total_cancelled,
                                            total_returned: u.total_returned,
                                            sales_list: v
                                        }, logged_in_user) {
                                        var w = {};
                                        w[f] = p, chrome.storage.local.set(w)
                                    }
                                } else v = m;
                                (updateTabs({
                                    update: "salesFlag",
                                    marketplace_css: marketplaces[r].css_tag,
                                    sales: u.net_sales
                                }), r == selected_marketplace.country_code) && (updateTabs({
                                    update: "todaysSalesList",
                                    data: v
                                }), updateTabs({
                                    update: "salesSummary",
                                    data: a
                                }));
                                0 == (n += -1) && function() {
                                    if (chrome.browserAction.setBadgeText({
                                            text: l.toString()
                                        }), i > 0) {
                                        for (var t = ["Good work", "Great work", "Congrats", "Keep it up", "Hooray", "Awesome"], a = Math.floor(6 * Math.random() + 0), r = "", s = 0; s < c.length; ++s) r += "➤ [" + c[s].marketplace_code.toUpperCase() + "] " + c[s].net_just_sold + " x " + c[s].asinName, c.length - s > 1 && (r += " \n");
                                        if (opt_showSalesNotif) {
                                            var o = {
                                                type: "basic",
                                                title: "You sold " + (i > 1 ? i : "a") + " product" + (i > 1 ? "s" : "") + ". " + t[a] + "!",
                                                message: r,
                                                contextMessage: "Powered by PrettyMerch",
                                                iconUrl: chrome.extension.getURL("/assets/img/new_sale_1_small.png")
                                            };
                                            chrome.notifications.create(o, (function(t) {
                                                newSaleNotification = t, sales_sound && sales_sound.play()
                                            }))
                                        }
                                    }! function(t) {
                                        "function" == typeof e && e(t)
                                    }(i)
                                }()
                            }))
                        }
                    }))
                }))
            }))
        }
    }))
}

function getSalesSummary(t, e, a, r, s, o, n) {
    if (loggedIn) {
        var i = t,
            l = r;
        s = s || 0, o = o || !1;
        var c, _ = 1,
            d = {},
            u = moment().startOf("day");
        switch (updateTabs({
                toggleLoaderDiv: !0,
                container: l,
                action: "show"
            }), i) {
            case "today":
                a = u, c = (e = u).format("M/D/YY");
                break;
            case "yesterday":
                e = moment(u).subtract(1, "days"), a = moment(u).subtract(1, "days"), c = e.format("M/D");
                break;
            case "last-seven-days":
                e = moment(u).subtract(7, "days"), a = moment(u), c = e.format("M/D") + " - " + a.format("M/D");
                break;
            case "last-two-weeks":
                e = moment(u).subtract(14, "days"), a = moment(u), c = e.format("M/D") + " - " + a.format("M/D");
                break;
            case "this-month":
                e = moment(u).startOf("month"), a = moment(u), c = e.format("M/D") + " - " + a.format("M/D");
                break;
            case "previous-month":
                e = moment(u).subtract(1, "month").startOf("month"), a = moment(u).subtract(1, "month").endOf("month").startOf("day"), c = e.format("MMM YY");
                break;
            case "top-sellers":
                e = moment(u).subtract(30, "days"), a = u;
                break;
            case "custom":
                e = moment(e).startOf("day"), a = moment(a).startOf("day"), c = e.format("MM/DD/YY") + " - " + a.format("MM/DD/YY");
                break;
            default:
                break
        }

        function p(t) {
            "function" == typeof n && n(t)
        }
        d.result_container = l, d.title_date = c, d.currency_symbol = selected_marketplace.currency_symbol,
            function t() {
                var r = "https://merch.amazon.com/api/reporting/purchases/records?marketplaceId=" + selected_marketplace.marketplace_id + "&fromDate=" + e.valueOf() + "&toDate=" + a.valueOf(),
                    n = new XMLHttpRequest;
                n.open("GET", r, !0), n.setRequestHeader("PrettyMerch", "true"), n.onreadystatechange = function() {
                    if (4 == n.readyState) {
                        if (-1 === xml_success_responsees.indexOf(n.status) || n.responseURL.includes("/429")) return _ >= 5 ? (checkLogIn(), p("")) : (++_, setTimeout((() => {
                            t()
                        }), 5e3)), !1;
                        if (-1 != n.responseText.indexOf("AuthenticationPortal")) checkLogIn();
                        else {
                            var e = "";
                            try {
                                e = JSON.parse(n.responseText)
                            } catch (t) {}
                            if (e) {
                                if ("top-sellers" == i) {
                                    var a = {},
                                        r = [],
                                        s = 0;
                                    Object.keys(e).forEach((function(t) {
                                        var a = e[t][selected_marketplace.marketplace_id][0].unitsSold - e[t][selected_marketplace.marketplace_id][0].unitsCancelled;
                                        a > 0 && (r[s] = JSON.parse(JSON.stringify(e[t][selected_marketplace.marketplace_id][0])), r[s].marketplace_extension = selected_marketplace.marketplace_extension, r[s].currency_symbol = selected_marketplace.currency_symbol, r[s].marketplace_code = selected_marketplace.country_code, r[s].net_sold = a, ++s)
                                    }));
                                    var l = r.length > 10 ? 10 : r.length;
                                    d.top_sellers = r.sort((function(t, e) {
                                        return e.net_sold - t.net_sold
                                    })).slice(0, l), d.top_royalties = r.sort((function(t, e) {
                                        return e.royalties.value - t.royalties.value
                                    })).slice(0, l), findVariationTotals(d.top_sellers, (function(t) {
                                        d.top_sellers = t.product_list, findVariationTotals(d.top_royalties, (function(t) {
                                            d.top_royalties = t.product_list, updateTabs({
                                                update: "topSellerSummary",
                                                data: d
                                            })
                                        }))
                                    }))
                                } else {
                                    var c = 0,
                                        u = 0,
                                        m = 0,
                                        f = 0,
                                        g = 0,
                                        h = 0,
                                        y = [];
                                    a = {};
                                    if (Object.keys(e).forEach((function(t) {
                                            a = JSON.parse(JSON.stringify(e[t][selected_marketplace.marketplace_id][0])), c += parseInt(a.unitsSold), u += parseInt(a.unitsCancelled), m += parseInt(a.unitsReturned), f += parseFloat(a.revenue.value), g += parseFloat(a.royalties.value), a.marketplace_extension = selected_marketplace.marketplace_extension, a.marketplace_code = selected_marketplace.country_code, a.currency_symbol = selected_marketplace.currency_symbol, a.net_sold = a.unitsSold - a.unitsCancelled, y[h] = a, ++h
                                        })), f = f.toFixed(2), g = g.toFixed(2), d.total_sales = c, d.total_returned = m, d.total_cancelled = u, d.net_sales = c - u, d.total_revenue = f, d.total_royalties = g, d.product_list = y.sort((function(t, e) {
                                            return e.net_sold - t.net_sold
                                        })), findVariationTotals(d.product_list, (function(t) {
                                            d.product_list = t.product_list, d.variation_totals = t.variation_totals
                                        })), !o) updateTabs({
                                        update: "salesSummary",
                                        data: d
                                    })
                                }
                                p(d)
                            } else p("")
                        }
                    }
                }, setTimeout((function() {
                    n.send()
                }), s)
            }()
    }
}

function createDaysChart(t, e, a) {
    if (loggedIn) {
        var r, s, o = t,
            n = "." + e,
            i = (a = a || 0, moment().startOf("day"));
        switch (o) {
            case "last-seven-days":
                r = moment(i).subtract(7, "days"), s = moment(i);
                break;
            default:
                break
        }
        getSalesCSV(r, s, [selected_marketplace.country_code], n, !1, a, !0, !1, !1, (function(t) {
            var a = {};
            a[selected_marketplace.country_code] = t[selected_marketplace.country_code].chart_data.daily, a[selected_marketplace.country_code].currency_symbol = selected_marketplace.currency_symbol, a.result_container = e, updateTabs({
                update: "createChart",
                data: a
            })
        }))
    }
}

function getDashboardSales(t) {
    t = t || "initial";
    var e = ["yesterday", "last-seven-days", "this-month", "previous-month"],
        a = ["last-seven-days"],
        r = ".last-seven-days-chart",
        s = ".top-sellers",
        o = moment().startOf("day").valueOf(),
        n = {
            yesterday: {
                startDate: moment(o).subtract(1, "days").valueOf(),
                endDate: moment(o).subtract(1, "days").valueOf(),
                title_date: moment(o).subtract(1, "days").format("M/D"),
                result_container: ".sales-summary.yesterday"
            },
            "last-seven-days": {
                startDate: moment(o).subtract(7, "days").valueOf(),
                endDate: o,
                title_date: moment(o).subtract(7, "days").format("M/D") + " - " + moment(o).format("M/D"),
                result_container: ".sales-summary.last-seven-days"
            },
            "last-14-days": {
                startDate: moment(o).subtract(13, "days").valueOf(),
                endDate: o,
                title_date: moment(o).subtract(13, "days").format("M/D") + " - " + moment(o).format("M/D"),
                result_container: !1
            },
            "last-thirty-days": {
                startDate: moment(o).subtract(29, "days").valueOf(),
                endDate: o,
                title_date: moment(o).subtract(29, "days").format("M/D") + " - " + moment(o).format("M/D"),
                result_container: !1
            },
            "last-90-days": {
                startDate: moment(o).subtract(89, "days").valueOf(),
                endDate: o,
                title_date: moment(o).subtract(89, "days").format("M/D") + " - " + moment(o).format("M/D"),
                result_container: !1
            },
            "this-month": {
                startDate: moment(o).startOf("month").valueOf(),
                endDate: o,
                title_date: moment(o).startOf("month").format("M/D") + " - " + moment(o).format("M/D"),
                result_container: ".sales-summary.this-month"
            },
            "previous-month": {
                startDate: moment(o).subtract(1, "month").startOf("month").valueOf(),
                endDate: moment(o).subtract(1, "month").endOf("month").startOf("day").valueOf(),
                title_date: moment(o).subtract(1, "month").startOf("month").format("MMM YY"),
                result_container: ".sales-summary.previous-month"
            }
        },
        i = {
            startDate: 0,
            endDate: 0
        };

    function l(t, a, r) {
        if (a < e.length) {
            var s = e[a];
            processRawSalesData(n[s].startDate, n[s].endDate, t, (function(e) {
                e.title_date = n[s].title_date, e.result_container = n[s].result_container, updateTabs({
                    update: "salesSummary",
                    data: e
                }), l(t, a + 1, r)
            }))
        } else "function" == typeof r && r()
    }
    "initial" == t ? (i.startDate = n["previous-month"].startDate, i.endDate = o) : "new-sale" == t && (i.startDate = n["this-month"].startDate < n["last-seven-days"].startDate ? n["this-month"].startDate : n["last-seven-days"].startDate, i.endDate = o, e = ["last-seven-days", "this-month"]), e.forEach((function(t) {
        n[t].result_container && updateTabs({
            toggleLoaderDiv: !0,
            container: n[t].result_container,
            action: "show"
        })
    })), updateTabs({
        toggleLoaderDiv: !0,
        container: s,
        action: "show"
    }), updateTabs({
        toggleProgressBar: !0,
        container: r,
        action: "show",
        title: "Downloading Sales..."
    }), fetchRawSalesData(i.startDate, i.endDate, ["all"], (function(e) {
        l(e, 0, (function() {
            var o, i;
            o = e, i = function() {
                updateTabs({
                    updateProgressBar: !0,
                    container: r,
                    title: "Download Complete...",
                    percentComplete: 100
                }), "initial" == t && function(t) {
                    var e = ["last-thirty-days"],
                        a = {};
                    a.result_container = s, processRawSalesData(n[e].startDate, n[e].endDate, t, (function(t) {
                        Object.keys(marketplaces).forEach((function(e) {
                            if (t.hasOwnProperty(e)) {
                                a[e] = {};
                                var r = t[e].product_list.length > 20 ? 20 : t[e].product_list.length;
                                a[e].top_sellers = t[e].product_list.sort((function(t, e) {
                                    return e.net_sold - t.net_sold
                                })).slice(0, r), a[e].top_royalties = t[e].product_list.sort((function(t, e) {
                                    return e.royalties.value - t.royalties.value
                                })).slice(0, r)
                            }
                        })), updateTabs({
                            update: "topSellerSummary",
                            data: a
                        })
                    }))
                }(e)
            }, summary_period = a, processRawSalesData(n[summary_period].startDate, n[summary_period].endDate, o, (function(t) {
                var e = {};
                e[selected_marketplace.country_code] = t[selected_marketplace.country_code].chart_data.daily, e[selected_marketplace.country_code].currency_symbol = selected_marketplace.currency_symbol, e.result_container = "last-seven-days-chart", updateTabs({
                    update: "createChart",
                    data: e
                }), updateTabs({
                    toggleProgressBar: !0,
                    container: r,
                    action: "hide",
                    title: ""
                }), i()
            }))
        }))
    }))
}

function processRawSalesData(t, e, a, r) {
    getSalesCSV(t, e, ["all"], "", "", 0, !0, !1, a, (function(t) {
        "function" == typeof r && r(t)
    }))
}

function fetchRawSalesData(t, e, a, r) {
    getSalesCSV(t, e, a = a || ["all"], "", "", 0, !0, !0, !1, (function(t) {
        var e;
        e = t, "function" == typeof r && r(e)
    }))
}
async function getProductsList(t, e, a, r) {
    (a = void 0 === a || a, t = t || !1) && updateTabs({
        toggleProgressBar: !0,
        container: t,
        action: "show",
        title: "Updating Products..."
    });
    waitForinitMain((function() {
        checkDesignerId((async function(s) {
            if (loggedIn && !gettingProductsList) {
                gettingProductsList = !0, e = e || 10, r = r || !1;
                var o = moment().startOf("day").valueOf(),
                    n = 0,
                    i = !0,
                    l = 0,
                    c = [],
                    _ = 0,
                    d = 1,
                    u = 0,
                    p = 0,
                    m = 0;
                if (await DB.transaction("r", DB.app_data, (async function() {
                        var t = await DB.app_data.get("force_refresh_products");
                        if (t && "true" == t.value && (a = !1), !(l = (l = await DB.app_data.get("last_product_list_full_download"))?.date ? l.date : 0)) {
                            var e = await DB.app_data.get("last_pageToken");
                            c = e?.data ? [...e.data] : [], n = e?.total_products_fetched ? e.total_products_fetched : 0, Array.isArray(c) || (c = [], n = 0)
                        }
                    })).catch((function(t) {})), a) v();
                else {
                    var f = 5,
                        g = "Preparing to Clear Database...";
                    if (t) {
                        var h = {
                            updateProgressBar: !0,
                            container: t,
                            title: g,
                            percentComplete: f
                        };
                        updateTabs(h)
                    }
                    var y = setTimeout((function e() {
                        (f += 3) > 95 && (f = 50);
                        t && updateTabs(h = {
                            updateProgressBar: !0,
                            container: t,
                            title: g,
                            percentComplete: f
                        });
                        y = setTimeout(e, 500)
                    }), 500);
                    force_stop_updating_product_meta_data((async function() {
                        g = "Clearing Database...", await DB.transaction("rw", DB.products, DB.app_data, (async function() {
                            await DB.products.clear(), await DB.app_data.delete("last_product_list_full_download"), await DB.app_data.delete("last_pageToken"), await DB.app_data.delete("last_product_list_update"), await DB.app_data.delete("last_product_list_sales_merge"), await DB.app_data.delete("last_all_live_listing_scrape"), await DB.app_data.delete("force_refresh_products")
                        })).then((function() {
                            l = 0, c = [], updateProductCount("reset", !1, !1, (function() {
                                clearTimeout(y), v()
                            }))
                        })).catch((function(e) {
                            t && updateTabs(h = {
                                updateProgressBar: !0,
                                container: t,
                                title: "Error clearing database. Please reload the page...",
                                percentComplete: "hold"
                            })
                        }))
                    }))
                }

                function v() {
                    setTimeout((function() {
                        T(c)
                    }), e)
                }

                function T(e) {
                    var a = {},
                        r = '{ "accountId": "' + G_DESIGNER_ID.accountId + '",  "pageSize": 500,  "pageToken": ' + JSON.stringify(e) + ',  "marketplaces": null,  "sortField": "DateUpdated",  "sortOrder": "Descending",  "status": ["DRAFT", "TRANSLATING", "REVIEW", "DECLINED", "AMAZON_REJECTED", "PUBLISHING", "PUBLISHED", "PROPAGATED", "TIMED_OUT", "DELETING", "DELETED"],  "deleteReasonType": ["", "CONTENT_POLICY_VIOLATION", "INACTIVE_NO_SALES", "CONTENT_CREATOR"],  "__type": "com.amazon.merch.search#FindListingsRequest" }',
                        s = new XMLHttpRequest;
                    s.open("POST", "https://merch.amazon.com/api/ng-amazon/coral/com.amazon.merch.search.MerchSearchService/FindListings", !0), s.setRequestHeader("PrettyMerch", "true"), s.onreadystatechange = async function() {
                        if (4 == s.readyState) {
                            if (-1 === xml_success_responsees.indexOf(s.status) || s.responseURL.includes("/429")) {
                                if (d >= 5) checkLogIn(), O([], !0);
                                else {
                                    ++d;
                                    var r = 6,
                                        c = setInterval((function() {
                                            r <= 0 ? (clearInterval(c), T(e)) : t && updateTabs({
                                                updateProgressBar: !0,
                                                container: t,
                                                title: "Conneciton Failed. Retrying in " + r + "s...",
                                                percentComplete: "hold"
                                            });
                                            r -= 1
                                        }), 1e3)
                                }
                                return !1
                            }
                            if (-1 != s.responseText.indexOf("AuthenticationPortal")) gettingProductsList = !1, checkLogIn();
                            else {
                                let e = !0;
                                try {
                                    e = !!(a = JSON.parse(s.responseText))?.results
                                } catch (t) {
                                    e = !1
                                }
                                if (e) {
                                    i = !0;
                                    var f = 0;
                                    ++_;
                                    var g = [],
                                        h = [];
                                    n += a.results.length, d = 1, await DB.transaction("r", DB.products, (async function() {
                                        for (var t = 0; t < a.results.length; t++) {
                                            var e = a.results[t];
                                            const s = await DB.products.get(e.listingId);
                                            var r;
                                            if (s)
                                                if (e.updatedDate == s.updatedDate && e.status == s.status);
                                                else if (i = !1, "DELETING" != e.status && "DELETED" != e.status || "CONTENT_CREATOR" != e.deleteReasonType)(r = JSON.parse(JSON.stringify(e))).pm_data = JSON.parse(JSON.stringify(s.pm_data)), g.push(r), u++, updateProductCount("update", r, s);
                                            else h.push(e.listingId), p++;
                                            else if (e.listingId)
                                                if ("DELETING" != e.status && "DELETED" != e.status || "CONTENT_CREATOR" != e.deleteReasonType) i = !1, m++, (r = JSON.parse(JSON.stringify(e))).pm_data = {}, g.push(r), updateProductCount("add", r, {});
                                                else f++
                                        }
                                    })).then((function() {})).catch((function() {})), f == a.results.length && (i = !1), i || (_ = 0), i && _ <= 1 && (i = !1), l || (i = !1);
                                    var y = n;
                                    if (i && (y = a.hitCount), progress_percent = y / a.hitCount * 100, t) updateTabs({
                                        updateProgressBar: !0,
                                        container: t,
                                        title: "Updating Products - " + y + " of " + a.hitCount,
                                        percentComplete: progress_percent
                                    });
                                    i || !a.results.length || a.results.length < 500 ? (i = !0, (!a.results.length || a.results.length < 500) && await DB.transaction("rw", DB.app_data, (async function() {
                                        var t = {
                                            title: "last_product_list_full_download",
                                            date: o
                                        };
                                        await DB.app_data.put(t)
                                    })).catch((function(t) {}))) : (await DB.transaction("rw", DB.app_data, (async function() {
                                        var t = {
                                            title: "last_pageToken",
                                            data: a.pageToken,
                                            total_products_fetched: n
                                        };
                                        await DB.app_data.put(t)
                                    })).catch((function(t) {})), T(a.pageToken)), bulkDeleteProducts(h, (function() {
                                        O(g, i)
                                    }))
                                } else O([], !0)
                            }
                        }
                    }, setTimeout((function() {
                        s.send(r)
                    }), 1e3 + Math.floor(500 * Math.random()) + 50)
                }

                function O(e, s) {
                    moment().startOf("day"), moment().startOf("day").valueOf();
                    var n = [],
                        i = 0;
                    for (i = 0; i < 1; i++) e.forEach((function(t, e, a) {
                        t.estimatedExpirationDate || (t.estimatedExpirationDate = -1), t.brandName || (t.brandName = ""), t.productTitle || (t.productTitle = ""), t.listPrice = parseFloat(t.listPrice.toFixed(2)), t.pm_data || (t.pm_data = {}), t.pm_data.product_texts || (t.pm_data.product_texts = {}, t.pm_data.product_texts.bullets = [], t.pm_data.product_texts.description = ""), t.pm_data.product_texts.needs_update = "true", t.pm_data.sales || (t.pm_data.sales = {}, t.pm_data.sales.date_of_first_sale = "0", t.pm_data.sales.date_of_last_sale = "0", t.pm_data.sales.total_net_sold = 0, t.pm_data.sales.total_revenue = 0, t.pm_data.sales.total_royalties = 0, 9223372036854776 == t.estimatedExpirationDate ? t.pm_data.sales.has_sales = "true" : t.pm_data.sales.has_sales = "false"), t.pm_data.reviews || (t.pm_data.reviews = {}, t.pm_data.reviews.num_of_reviews = 0, t.pm_data.reviews.review_score = 0), t.pm_data.bsr || (t.pm_data.bsr = {}, t.pm_data.bsr.bsr_val_clean = 0, t.pm_data.bsr.bsr_val = "0", t.pm_data.bsr.bsr_category = ""), t.status && "PUBLISHED" == t.status && (t.pm_data.date_of_last_listing_scrape = "2015-09-01", t.pm_data.availability || (t.pm_data.availability = {})), t.pm_data.status = "", t.status && G_AMAZON_INTERNAL_FLAGS.status_flags[t.status] && (t.pm_data.status = G_AMAZON_INTERNAL_FLAGS.status_flags[t.status]), t.pm_data.delete_reason = "", t.deleteReasonType && G_AMAZON_INTERNAL_FLAGS.status_flags[t.deleteReasonType] && (t.pm_data.delete_reason = G_AMAZON_INTERNAL_FLAGS.status_flags[t.deleteReasonType]), t.pm_data.product_type = "", t.productType && G_AMAZON_INTERNAL_FLAGS.product_flags[t.productType] && (t.pm_data.product_type = G_AMAZON_INTERNAL_FLAGS.product_flags[t.productType]), t.pm_data.asin = "", t.asin && (t.pm_data.asin = t.asin), t.pm_data.marketplace_country_code = "", t.pm_data.marketplace_extension = "", t.pm_data.marketplace_country_name = "", t.pm_data.marketplace_flag_img = "", t.pm_data.currency_symbol = "";
                        var r = t.marketplace.toLowerCase();
                        Object.keys(marketplaces).forEach((function(e) {
                            r == marketplaces[e].country_code_official && (t.pm_data.marketplace_country_code = marketplaces[e].country_code, t.pm_data.marketplace_extension = marketplaces[e].marketplace_extension, t.pm_data.marketplace_country_name = marketplaces[e].country_name, t.pm_data.marketplace_flag_img = marketplaces[e].flag_img, t.pm_data.currency_symbol = marketplaces[e].currency_symbol)
                        })), n.push(JSON.parse(JSON.stringify(t)))
                    }));
                    var l = u + m + p;
                    saveProductList(n, (async function() {
                        if (s) {
                            if (await DB.transaction("rw", DB.products, DB.app_data, (async function() {
                                    var t, e = await DB.products.orderBy("updatedDate").reverse().limit(500).toArray();
                                    0 == l && G_PRODUCT_COUNT.total_products ? t = G_PRODUCT_COUNT.total_products : (t = await DB.products.toCollection().count(), G_PRODUCT_COUNT.total_products = t, updateProductCount("save")), t = !G_IS_PRO && t > 500 ? 500 : t;
                                    var a = [];
                                    Object.keys(G_PRODUCT_COUNT.productType).forEach((function(t) {
                                        G_PRODUCT_COUNT.productType[t] > 0 && a.push(t)
                                    }));
                                    var r = a.map((function(t) {
                                        return {
                                            default_name: t,
                                            pretty_name: G_AMAZON_INTERNAL_FLAGS.product_flags[t]
                                        }
                                    }));
                                    r.sort((function(t, e) {
                                        var a = t.pretty_name,
                                            r = e.pretty_name;
                                        return G_PRODUCT_TYPE_SORT_ORDER.indexOf(a) > G_PRODUCT_TYPE_SORT_ORDER.indexOf(r) ? 1 : -1
                                    }));
                                    var s = {
                                        title: "last_product_list_update",
                                        date: o
                                    };
                                    await DB.app_data.put(s);
                                    updateTabs({
                                        update: "productList",
                                        productList: {
                                            lastUpdate: o,
                                            products_list: e,
                                            product_count: t,
                                            other_data: {
                                                product_types: r
                                            }
                                        },
                                        numberOfChanges: l
                                    })
                                })).then((function() {})).catch((function(t) {})), t) updateTabs({
                                toggleProgressBar: !0,
                                container: t,
                                action: "hide",
                                title: ""
                            });
                            gettingProductsList = !1,
                                function() {
                                    a || (G_FORCE_STOP_UPDATING_PRODUCT_META_DATA = !1, updateProductMetaData(!1, 2e3));
                                    "function" == typeof r && r()
                                }()
                        }
                    }))
                }
            }
        }))
    }))
}

function updateProductMetaData(t, e) {
    t = t || !1, e = e || 100;
    var a = !1,
        r = !1,
        s = !1,
        o = !1,
        n = moment().startOf("day").valueOf(),
        i = moment().format("YYYY-MM-DD"),
        l = !1,
        c = !1,
        _ = !1;

    function d() {
        l && c && _ && (G_IS_UPDATING_PRODUCT_META_DATA = !1, overall_progress = 100, updateTabs({
            updateDbProgressBar: "true",
            progress_data: {
                action: "hide",
                text: "",
                progress: 100
            }
        }))
    }
    waitForinitMain((async function() {
        setTimeout((async function() {
            if (!G_IS_UPDATING_PRODUCT_META_DATA && !G_FORCE_STOP_UPDATING_PRODUCT_META_DATA)
                if (G_IS_UPDATING_PRODUCT_META_DATA = !0, await DB.transaction("r", DB.app_data, (async function() {
                        a = await DB.app_data.get("last_all_time_sales_update"), r = await DB.app_data.get("last_product_list_full_download"), s = await DB.app_data.get("last_product_list_update"), o = await DB.app_data.get("last_product_list_sales_merge"), await DB.app_data.get("last_all_live_listing_scrape")
                    })).then((function() {})).catch((function(t) {})), r && r.date && a && a.date == n && s && s.date == n) {
                    t = !1;
                    var e = 0,
                        u = 0,
                        p = 0,
                        m = 0,
                        f = 0,
                        g = 0,
                        h = 0,
                        y = 0,
                        v = 0;
                    updateTabs({
                        updateDbProgressBar: "true",
                        progress_data: {
                            action: "show",
                            text: "",
                            progress: 0
                        }
                    });
                    var T = moment(n).subtract(1, "days").valueOf(),
                        O = moment(beginning_of_time).valueOf(),
                        D = T,
                        b = moment(beginning_of_time).valueOf(),
                        w = moment(n).subtract(5, "days").valueOf(),
                        k = 0;
                    async function P(t, a, r, s) {
                        var n = [],
                            l = [];

                        function c() {
                            "function" != typeof s || s()
                        }
                        G_FORCE_STOP_UPDATING_PRODUCT_META_DATA ? c() : t <= a ? getSalesCSV(t, a, ["all"], !1, !1, 0, !0, !1, !1, (async function(t) {
                            Object.keys(marketplaces).forEach((function(a) {
                                if (a in t) {
                                    e += t[a].product_list.length;
                                    for (var r = 0; r < t[a].product_list.length;) {
                                        var s = [],
                                            o = [],
                                            i = [],
                                            c = r + 100;
                                        s = t[a].product_list.slice(r, c), r += 100, s.forEach((function(t, e, a) {
                                            t.asin && (o[t.asin] = t, i.push(t.asin))
                                        })), n.push(o), l.push(i)
                                    }
                                }
                            })), t = "";
                            for (var a = 0; a < l.length; ++a) {
                                var s = [];
                                await DB.transaction("rw", DB.products, (async function() {
                                    if (l[a].length && (s = await DB.products.where("asin").anyOf(l[a]).toArray()).length) {
                                        for (var t = 0; t < s.length; ++t) s[t].pm_data || (s[t].pm_data = {}), "todays_sales" != r && "previous_sales" != r || (s[t].pm_data.sales || (s[t].pm_data.sales = {}), (!s[t].pm_data.sales.has_sales || s[t].pm_data.sales.has_sales && "false" == s[t].pm_data.sales.has_sales) && ++k, s[t].pm_data.sales.has_sales = "true", s[t].pm_data.sales.date_of_first_sale && s[t].pm_data.sales.date_of_first_sale <= n[a][s[t].asin].date_of_first_sale || (s[t].pm_data.sales.date_of_first_sale = n[a][s[t].asin].date_of_first_sale), s[t].pm_data.sales.date_of_last_sale && s[t].pm_data.sales.date_of_last_sale >= n[a][s[t].asin].date_of_last_sale || (s[t].pm_data.sales.date_of_last_sale = n[a][s[t].asin].date_of_last_sale), s[t].pm_data.sales.hasOwnProperty("todays_sales") || (s[t].pm_data.sales.todays_sales = {}, s[t].pm_data.sales.todays_sales.total_net_sold = 0, s[t].pm_data.sales.todays_sales.total_revenue = 0, s[t].pm_data.sales.todays_sales.total_royalties = 0), s[t].pm_data.sales.hasOwnProperty("previous_sales") || (s[t].pm_data.sales.previous_sales = {}, s[t].pm_data.sales.previous_sales.total_net_sold = 0, s[t].pm_data.sales.previous_sales.total_revenue = 0, s[t].pm_data.sales.previous_sales.total_royalties = 0), "todays_sales" == r && (s[t].pm_data.sales.todays_sales.total_net_sold = n[a][s[t].asin].net_sold, s[t].pm_data.sales.todays_sales.total_revenue = parseFloat(n[a][s[t].asin].revenue.value.toFixed(2)), s[t].pm_data.sales.todays_sales.total_royalties = parseFloat(n[a][s[t].asin].royalties.value.toFixed(2))), "previous_sales" == r && (o || (s[t].pm_data.sales.previous_sales = {}, s[t].pm_data.sales.previous_sales.total_net_sold = 0, s[t].pm_data.sales.previous_sales.total_revenue = 0, s[t].pm_data.sales.previous_sales.total_royalties = 0), s[t].pm_data.sales.previous_sales.total_net_sold += n[a][s[t].asin].net_sold, s[t].pm_data.sales.previous_sales.total_revenue += parseFloat(n[a][s[t].asin].revenue.value.toFixed(2)), s[t].pm_data.sales.previous_sales.total_royalties += parseFloat(n[a][s[t].asin].royalties.value.toFixed(2))), s[t].pm_data?.sales?.date_of_last_sale == i ? (s[t].pm_data.sales.total_net_sold = s[t].pm_data.sales.previous_sales.total_net_sold + s[t].pm_data.sales.todays_sales.total_net_sold, s[t].pm_data.sales.total_revenue = s[t].pm_data.sales.previous_sales.total_revenue + s[t].pm_data.sales.todays_sales.total_revenue, s[t].pm_data.sales.total_royalties = s[t].pm_data.sales.previous_sales.total_royalties + s[t].pm_data.sales.todays_sales.total_royalties) : (s[t].pm_data.sales.total_net_sold = s[t].pm_data.sales.previous_sales.total_net_sold, s[t].pm_data.sales.total_revenue = s[t].pm_data.sales.previous_sales.total_revenue, s[t].pm_data.sales.total_royalties = s[t].pm_data.sales.previous_sales.total_royalties)), "flag_for_review" == r && (s[t].pm_data.reviews && s[t].pm_data.reviews.last_update && s[t].pm_data.reviews.last_update == i || (s[t].pm_data.reviews || (s[t].pm_data.reviews = {}), s[t].pm_data.reviews.needs_review_update = "true"));
                                        await DB.products.bulkPut(s)
                                    }
                                })).then((function() {
                                    u += s.length, updateTabs({
                                        updateDbProgressBar: "true",
                                        progress_data: {
                                            action: "update",
                                            text: "Sales",
                                            progress: ((p = u / e * 100) + g + v) / 3
                                        }
                                    })
                                })).catch((function(t) {
                                    c()
                                }))
                            }
                            c()
                        })) : c()
                    }
                    o && (o.date < n ? (O = o.date, b = moment(o.date).subtract(50, "days").valueOf(), o.date < b && (b = o.date)) : (O = n, b = n)), P(n, n, "todays_sales", (function() {
                        P(O, D, "previous_sales", (function() {
                            P(b, w, "flag_for_review", (function() {
                                !async function() {
                                    ((p = 100) + g + v) / 3, G_PRODUCT_COUNT.has_sales.true = G_PRODUCT_COUNT.has_sales.true + k, G_PRODUCT_COUNT.has_sales.false = G_PRODUCT_COUNT.total_products - G_PRODUCT_COUNT.has_sales.true, await DB.transaction("rw", DB.app_data, (async function() {
                                        var t = {
                                            title: "last_product_list_sales_merge",
                                            date: n
                                        };
                                        await DB.app_data.put(t)
                                    })).then((function() {})).catch((function(t) {})), updateProductCount("save", !1, !1, (function() {
                                        l = !0, d(), S(), N()
                                    }))
                                }()
                            }))
                        }))
                    }));
                    var C = 0,
                        R = 0,
                        I = 0;
                    async function S() {
                        var e = [],
                            a = 0,
                            r = 0;
                        if (await DB.transaction("r", DB.products, (async function() {
                                0 == m && (m = t ? await DB.products.where("pm_data.date_of_last_listing_scrape").between(Dexie.minKey, i, !0, !1).count() : await DB.products.where("[pm_data.reviews.needs_review_update+pm_data.sales.date_of_last_sale]").between(["true", Dexie.minKey], ["true", Dexie.maxKey]).count()), e = t ? await DB.products.where("pm_data.date_of_last_listing_scrape").between(Dexie.minKey, i, !0, !1).limit(1).toArray() : await DB.products.where("[pm_data.reviews.needs_review_update+pm_data.sales.date_of_last_sale]").between(["true", Dexie.minKey], ["true", Dexie.maxKey]).reverse().limit(1).toArray()
                            })).then((function() {})).catch((function(t) {})), e.length && !G_FORCE_STOP_UPDATING_PRODUCT_META_DATA) {
                            for (var s = e.length, o = 0; o < e.length; ++o) {
                                var l = Math.floor(401 * Math.random() + 800);
                                ! function(o) {
                                    fetchProductListingDetails(e[o].asin, e[o].productType, e[o].pm_data.marketplace_extension, l, (async function(n) {
                                        if (n) {
                                            if (e[o].pm_data || (e[o].pm_data = {}), e[o].pm_data.reviews || (e[o].pm_data.reviews = {}), n.reviews.num_of_reviews) {
                                                e[o].pm_data.reviews.hasOwnProperty("num_of_reviews") && 0 != e[o].pm_data.reviews.num_of_reviews || ++C;
                                                var l = e[o].pm_data.reviews.hasOwnProperty("num_of_reviews") ? e[o].pm_data.reviews.num_of_reviews : 0,
                                                    c = n.reviews.num_of_reviews - l;
                                                a += c, e[o].pm_data.reviews.num_of_reviews = n.reviews.num_of_reviews
                                            }
                                            if (n.reviews.review_score) {
                                                var d = e[o].pm_data.reviews.hasOwnProperty("review_score") ? e[o].pm_data.reviews.review_score : 0,
                                                    u = n.reviews.review_score - d;
                                                r += u, e[o].pm_data.reviews.review_score = n.reviews.review_score
                                            }
                                            e[o].pm_data.bsr || (e[o].pm_data.bsr = {}), n.bsr.hasOwnProperty("bsr_val_clean") && (e[o].pm_data.bsr.hasOwnProperty("bsr_val_clean") && 0 != e[o].pm_data.bsr.bsr_val_clean || n.bsr.bsr_val_clean > 0 && ++R, e[o].pm_data.bsr.hasOwnProperty("bsr_val_clean") && e[o].pm_data.bsr.bsr_val_clean > 0 && 0 == n.bsr.bsr_val_clean && --R, e[o].pm_data.bsr.bsr_val_clean = n.bsr.bsr_val_clean), n.bsr.bsr_val && (e[o].pm_data.bsr.bsr_val = n.bsr.bsr_val), n.bsr.bsr_category && (e[o].pm_data.bsr.bsr_category = n.bsr.bsr_category), e[o].pm_data.availability || (e[o].pm_data.availability = {}), n.availability && ("PUBLISHED" != e[o].status || e[o].pm_data.availability.hasOwnProperty("buyable") && "false" != e[o].pm_data.availability.buyable || "true" == n.availability.buyable && ++I, "PUBLISHED" == e[o].status && e[o].pm_data.availability.hasOwnProperty("buyable") && "true" == e[o].pm_data.availability.buyable && "false" == n.availability.buyable && --I, e[o].pm_data.availability = JSON.parse(JSON.stringify(n.availability))), n.listing_images && (e[o].pm_data.listing_images = JSON.parse(JSON.stringify(n.listing_images))), n.color_option_images && (e[o].pm_data.color_option_images = JSON.parse(JSON.stringify(n.color_option_images)))
                                        }
                                        e[o].pm_data.reviews.last_update = i, e[o].pm_data.bsr.last_update = i, e[o].pm_data.reviews.needs_review_update = "false", t && (e[o].pm_data.date_of_last_listing_scrape = i), await DB.transaction("rw", DB.products, (async function() {
                                            await DB.products.update(e[o].listingId, {
                                                "pm_data.reviews": e[o].pm_data.reviews,
                                                "pm_data.bsr": e[o].pm_data.bsr,
                                                "pm_data.availability": e[o].pm_data.availability,
                                                "pm_data.listing_images": e[o].pm_data.listing_images,
                                                "pm_data.color_option_images": e[o].pm_data.color_option_images,
                                                "pm_data.date_of_last_listing_scrape": e[o].pm_data.date_of_last_listing_scrape
                                            })
                                        })).then((function() {})).catch((function(t) {})), 0 == --s && _()
                                    }))
                                }(o)
                            }
                            async function _() {
                                await DB.transaction("rw", DB.products, (async function() {})).then((function() {
                                    f += e.length, updateTabs({
                                        updateDbProgressBar: "true",
                                        progress_data: {
                                            action: "update",
                                            text: "Reviews, BSR & Availability",
                                            progress: (p + (g = f / m * 100) + v) / 3
                                        }
                                    }), G_PRODUCT_COUNT.has_reviews.true = G_PRODUCT_COUNT.has_reviews.hasOwnProperty("true") ? G_PRODUCT_COUNT.has_reviews.true + C : C, G_PRODUCT_COUNT.has_reviews.false = G_PRODUCT_COUNT.total_products - G_PRODUCT_COUNT.has_reviews.true, G_PRODUCT_COUNT.has_reviews.total_review_count = G_PRODUCT_COUNT.has_reviews.hasOwnProperty("total_review_count") ? G_PRODUCT_COUNT.has_reviews.total_review_count + a : a, G_PRODUCT_COUNT.has_reviews.total_review_score = G_PRODUCT_COUNT.has_reviews.hasOwnProperty("total_review_score") ? G_PRODUCT_COUNT.has_reviews.total_review_score + r : r, G_PRODUCT_COUNT.has_bsr.true = G_PRODUCT_COUNT.has_bsr.hasOwnProperty("true") ? G_PRODUCT_COUNT.has_bsr.true + R : R, G_PRODUCT_COUNT.has_bsr.false = G_PRODUCT_COUNT.total_products - G_PRODUCT_COUNT.has_bsr.true, G_PRODUCT_COUNT.is_buyable.true = G_PRODUCT_COUNT.is_buyable.hasOwnProperty("true") ? G_PRODUCT_COUNT.is_buyable.true + I : I, G_PRODUCT_COUNT.is_buyable.false = G_PRODUCT_COUNT.status.hasOwnProperty("PUBLISHED") ? G_PRODUCT_COUNT.status.PUBLISHED - G_PRODUCT_COUNT.is_buyable.true : 0, C = 0, R = 0, I = 0, updateTabs({
                                        update: "publishedItemsSummary",
                                        data: {
                                            toggleLoader: "show",
                                            buyableProducts: G_PRODUCT_COUNT.is_buyable.true,
                                            publishedItemCount: G_PRODUCT_COUNT.status.PUBLISHED,
                                            productsWithReviews: G_PRODUCT_COUNT.has_reviews.true,
                                            totalReviews: G_PRODUCT_COUNT.has_reviews.total_review_count,
                                            totalReviewScore: G_PRODUCT_COUNT.has_reviews.total_review_score
                                        }
                                    }), updateProductCount("save", !1, !1, (function() {
                                        S()
                                    }))
                                })).catch((function(t) {}))
                            }
                        } else {
                            (p + (g = 100) + v) / 3;
                            updateTabs({
                                update: "publishedItemsSummary",
                                data: {
                                    toggleLoader: "hide"
                                }
                            }), t && f == m && await DB.transaction("rw", DB.app_data, (async function() {
                                var t = {
                                    title: "last_all_live_listing_scrape",
                                    date: n
                                };
                                await DB.app_data.put(t)
                            })).then((function() {})).catch((function(t) {})), c = !0, d()
                        }
                    }
                    async function N() {
                        var t = [];
                        await DB.transaction("r", DB.products, (async function() {
                            0 == h && (h = await DB.products.where("[pm_data.product_texts.needs_update+updatedDate]").between(["true", Dexie.minKey], ["true", Dexie.maxKey]).count()), t = await DB.products.where("[pm_data.product_texts.needs_update+updatedDate]").between(["true", Dexie.minKey], ["true", Dexie.maxKey]).reverse().limit(1).toArray()
                        })).then((function() {})).catch((function(t) {}));
                        var e = {},
                            a = [];
                        if (t.length && !G_FORCE_STOP_UPDATING_PRODUCT_META_DATA) {
                            for (var r = 0; r < t.length; ++r) t[r].designId && (e[t[r].designId] = {});
                            var s = Object.keys(e).length;
                            Object.keys(e).forEach((function(t) {
                                a.push(t), fetchProductDesignDetails(t, (function(r) {
                                    if (r && r.hasOwnProperty("textData")) try {
                                        e[t] = JSON.parse(JSON.stringify(r))
                                    } catch (t) {}
                                    0 == --s && async function() {
                                        var t = 0,
                                            r = [];
                                        await DB.transaction("rw", DB.products, (async function() {
                                            if (a.length && (r = await DB.products.where("designId").anyOf(a).toArray()).length)
                                                for (var s = 0; s < r.length; ++s)
                                                    if (r[s].pm_data && r[s].pm_data.product_texts && r[s].pm_data.product_texts.needs_update && "true" == r[s].pm_data.product_texts.needs_update) {
                                                        r[s].pm_data || (r[s].pm_data = {}), r[s].pm_data.product_texts || (r[s].pm_data.product_texts = {});
                                                        var o = "en";
                                                        Object.values(marketplaces).forEach((function(t) {
                                                            r[s].marketplace.toLowerCase() == t.country_code_official && (o = t.country_language_code)
                                                        })), r[s].pm_data.product_texts.description = "", e[r[s].designId] && e[r[s].designId].textData && e[r[s].designId].textData[o] && e[r[s].designId].textData[o].description && (r[s].pm_data.product_texts.description = e[r[s].designId].textData[o].description), r[s].pm_data.product_texts.bullets = [], e[r[s].designId] && e[r[s].designId].textData && e[r[s].designId].textData[o] && e[r[s].designId].textData[o].bullets && e[r[s].designId].textData[o].bullets.forEach((function(t) {
                                                            r[s].pm_data.product_texts.bullets.push(t)
                                                        })), ++t, r[s].pm_data.product_texts.last_update = i, r[s].pm_data.product_texts.needs_update = "false", await DB.products.update(r[s].listingId, {
                                                            "pm_data.product_texts": r[s].pm_data.product_texts
                                                        })
                                                    }
                                        })).then((function() {})).catch((function(t) {})), updateTabs({
                                            updateDbProgressBar: "true",
                                            progress_data: {
                                                action: "update",
                                                text: "Bullets & Descriptions",
                                                progress: (p + g + (v = (y += t) / h * 100)) / 3
                                            }
                                        }), N()
                                    }()
                                }))
                            }))
                        } else(p + g + (v = 100)) / 3, _ = !0, d()
                    }
                } else G_IS_UPDATING_PRODUCT_META_DATA = !1
        }), e)
    }))
}

function force_stop_updating_product_meta_data(t) {
    G_FORCE_STOP_UPDATING_PRODUCT_META_DATA = !0,
        function e() {
            G_IS_UPDATING_PRODUCT_META_DATA ? setTimeout(e, 300) : "function" == typeof t && t()
        }()
}
async function saveProductList(t, e) {
    t.length && await DB.transaction("rw", DB.products, (function() {
        DB.products.bulkPut(t).then((function() {}))
    })).then((function() {
        updateProductCount("save")
    })).catch((function(t) {})), "function" == typeof e && e()
}
async function bulkDeleteProducts(t, e) {
    if (t.length) {
        var a = [];
        await DB.transaction("rw", DB.products, (async function() {
            a = await DB.products.where("listingId").anyOf(t).toArray(), DB.products.bulkDelete(t).then((function() {
                a.forEach((function(t) {
                    updateProductCount("delete", {}, t)
                }))
            }))
        })).then((function() {
            updateProductCount("save")
        })).catch((function(t) {}))
    }
    "function" == typeof e && e()
}
async function updateProductCount(t, e, a, r) {
    if ("add" == t) {
        G_PRODUCT_COUNT.total_products = G_PRODUCT_COUNT.total_products ? G_PRODUCT_COUNT.total_products + 1 : 1, G_PRODUCT_COUNT.marketplace[e.marketplace] = G_PRODUCT_COUNT.marketplace[e.marketplace] ? G_PRODUCT_COUNT.marketplace[e.marketplace] + 1 : 1, G_PRODUCT_COUNT.status[e.status] = G_PRODUCT_COUNT.status[e.status] ? G_PRODUCT_COUNT.status[e.status] + 1 : 1, G_PRODUCT_COUNT.productType[e.productType] = G_PRODUCT_COUNT.productType[e.productType] ? G_PRODUCT_COUNT.productType[e.productType] + 1 : 1;
        var s = 9223372036854776 == e.estimatedExpirationDate ? "true" : "false";
        if (G_PRODUCT_COUNT.has_sales[s] = G_PRODUCT_COUNT.has_sales[s] ? G_PRODUCT_COUNT.has_sales[s] + 1 : 1, e.pm_data.hasOwnProperty("reviews") && e.pm_data.reviews.hasOwnProperty("num_of_reviews")) {
            var o = e.pm_data.reviews.num_of_reviews > 0 ? "true" : "false";
            G_PRODUCT_COUNT.has_reviews[o] = G_PRODUCT_COUNT.has_reviews[o] ? G_PRODUCT_COUNT.has_reviews[o] + 1 : 1
        }
        if (e.pm_data.hasOwnProperty("bsr") && e.pm_data.bsr.hasOwnProperty("bsr_val_clean")) {
            var n = e.pm_data.bsr.bsr_val_clean > 0 ? "true" : "false";
            G_PRODUCT_COUNT.has_bsr[n] = G_PRODUCT_COUNT.has_bsr[n] ? G_PRODUCT_COUNT.has_bsr[n] + 1 : 1
        }
        if (e.pm_data.hasOwnProperty("availability") && e.pm_data.availability.hasOwnProperty("buyable") && e.status && "PUBLISHED" == e.status) {
            var i = "true" == e.pm_data.availability.buyable ? "true" : "false";
            G_PRODUCT_COUNT.is_buyable[i] = G_PRODUCT_COUNT.is_buyable[i] ? G_PRODUCT_COUNT.is_buyable[i] + 1 : 1
        }
    }
    if ("delete" == t) {
        G_PRODUCT_COUNT.total_products = G_PRODUCT_COUNT.total_products && G_PRODUCT_COUNT.total_products > 0 ? G_PRODUCT_COUNT.total_products - 1 : 0, G_PRODUCT_COUNT.marketplace[a.marketplace] = G_PRODUCT_COUNT.marketplace[a.marketplace] && G_PRODUCT_COUNT.marketplace[a.marketplace] > 0 ? G_PRODUCT_COUNT.marketplace[a.marketplace] - 1 : 0, G_PRODUCT_COUNT.status[a.status] = G_PRODUCT_COUNT.status[a.status] && G_PRODUCT_COUNT.status[a.status] > 0 ? G_PRODUCT_COUNT.status[a.status] - 1 : 0, G_PRODUCT_COUNT.productType[a.productType] = G_PRODUCT_COUNT.productType[a.productType] && G_PRODUCT_COUNT.productType[a.productType] > 0 ? G_PRODUCT_COUNT.productType[a.productType] - 1 : 0;
        s = 9223372036854776 == a.estimatedExpirationDate ? "true" : "false";
        if (G_PRODUCT_COUNT.has_sales[s] = G_PRODUCT_COUNT.has_sales[s] && G_PRODUCT_COUNT.has_sales[s] > 0 ? G_PRODUCT_COUNT.has_sales[s] - 1 : 0, a.pm_data.hasOwnProperty("reviews") && a.pm_data.reviews.hasOwnProperty("num_of_reviews")) {
            o = a.pm_data.reviews.num_of_reviews > 0 ? "true" : "false";
            G_PRODUCT_COUNT.has_reviews[o] = G_PRODUCT_COUNT.has_reviews[o] && G_PRODUCT_COUNT.has_reviews[o] > 0 ? G_PRODUCT_COUNT.has_reviews[o] - 1 : 0
        }
        if (a.pm_data.hasOwnProperty("bsr") && a.pm_data.bsr.hasOwnProperty("bsr_val_clean")) {
            n = a.pm_data.bsr.bsr_val_clean > 0 ? "true" : "false";
            G_PRODUCT_COUNT.has_bsr[n] = G_PRODUCT_COUNT.has_bsr[n] && G_PRODUCT_COUNT.has_bsr[n] > 0 ? G_PRODUCT_COUNT.has_bsr[n] - 1 : 0
        }
        if (a.pm_data.hasOwnProperty("availability") && a.pm_data.availability.hasOwnProperty("buyable") && a.status && "PUBLISHED" == a.status) {
            i = "true" == a.pm_data.availability.buyable ? "true" : "false";
            G_PRODUCT_COUNT.is_buyable[i] = G_PRODUCT_COUNT.is_buyable[i] && G_PRODUCT_COUNT.is_buyable[i] > 0 ? G_PRODUCT_COUNT.is_buyable[i] - 1 : 0
        }
    } else "update" == t ? (G_PRODUCT_COUNT.status[e.status] = G_PRODUCT_COUNT.status[e.status] ? G_PRODUCT_COUNT.status[e.status] + 1 : 1, G_PRODUCT_COUNT.status[a.status] = G_PRODUCT_COUNT.status[a.status] && G_PRODUCT_COUNT.status[a.status] > 0 ? G_PRODUCT_COUNT.status[a.status] - 1 : 0) : "reset" == t ? (G_PRODUCT_COUNT = {
        title: "product_count",
        total_products: 0,
        marketplace: {},
        status: {},
        productType: {},
        has_sales: {},
        has_reviews: {},
        has_bsr: {},
        is_buyable: {}
    }, updateProductCount("save", !1, !1, (function() {
        l()
    }))) : "save" == t && await DB.transaction("rw", DB.app_data, (async function() {
        await DB.app_data.put(G_PRODUCT_COUNT)
    })).then((function() {
        l()
    })).catch((function(t) {}));

    function l() {
        "function" == typeof r && r()
    }
}

function filterProducts(t, e) {
    var a = {},
        r = [],
        s = [],
        o = !1,
        n = 0,
        i = 1e4;
    waitForinitMain((async function() {
        t.forEach((function(t) {
            "sort" == t.action ? a = {
                sort_by: t.property && "" != t.property ? t.property : "updatedDate",
                direction: t.value && "" != t.value ? t.value : "desc"
            } : "search_text" == t.action && "" != t.value ? (o = !0, r.push(t)) : "filter" == t.action && "all" != t.value && (o = !0, t.hasOwnProperty("filter_count") && t.filter_count.id && t.filter_count.val && G_PRODUCT_COUNT[t.filter_count.id] && (G_PRODUCT_COUNT[t.filter_count.id][t.filter_count.val] ? t.result_count = G_PRODUCT_COUNT[t.filter_count.id][t.filter_count.val] : t.result_count = 0), r.push(t))
        })), r.sort((function(t, e) {
            return t.result_count - e.result_count
        })), await DB.transaction("r", DB.products, (async function() {
            if (G_IS_PRO) {
                if (0 == r.length) s = "desc" == a.direction ? await DB.products.orderBy(a.sort_by).reverse().limit(500).toArray() : await DB.products.orderBy(a.sort_by).limit(500).toArray();
                else if (r.length > 0)
                    if ("result_count" in r[0] && 0 == r[0].result_count);
                    else if ("result_count" in r[0] && r[0].result_count <= i) s = await d(r[0].property, r[0].operator, r[0].value);
                else {
                    for (var t = -1, e = [], o = 0; o < r.length; ++o)
                        if (!("result_count" in r[o]) && "search_text" != r[o].action) {
                            var l = 0;
                            if ("equals" == r[o].operator) l = await DB.products.where(r[o].property).equals(r[o].value).count();
                            else if ("between" == r[o].operator) {
                                var c = 0,
                                    _ = 0;
                                "pm_data.sales.date_of_last_sale" == r[o].property ? (c = r[o].value[0], _ = r[o].value[1]) : (c = parseFloat(r[o].value[0]), _ = parseFloat(r[o].value[1])), l = await DB.products.where(r[o].property).between(c, _, r[o].value[2], r[o].value[3]).count()
                            }
                            l <= i && (t = l, e.push(r[o].property, r[o].operator, r[o].value), o = r.length)
                        } 0 == t || (s = t > 0 ? await d(e[0], e[1], e[2]) : await async function(t, e) {
                        var a = 0,
                            r = [],
                            s = [];
                        do {
                            if (0 == a) r = "desc" == e ? await DB.products.orderBy(t).reverse().limit(i).toArray() : await DB.products.orderBy(t).limit(i).toArray();
                            else {
                                var o = r[r.length - 1],
                                    l = "[" + t + "+listingId]";
                                r = "desc" == e ? await DB.products.where(l).below([o.updatedDate, o.listingId]).reverse().limit(i).toArray() : await DB.products.where(l).above([o.updatedDate, o.listingId]).limit(i).toArray()
                            }++a, r.length;
                            var c = u(r);
                            s.push(...c)
                        } while (r.length == i && s.length <= 1001);
                        n = r.length < i || s.length < 1001 ? s.length : "1000+";
                        return s
                    }(a.sort_by, a.direction))
                }
            } else s = u(s = await DB.products.orderBy("updatedDate").reverse().limit(500).toArray()), n = s.length;
            async function d(t, e, a) {
                var r = [];
                if ("equals" == e) r = await DB.products.where(t).equals(a).limit(i).toArray();
                else if ("not_equals" == e) r = await DB.products.where(t).notEqual(a).limit(i).toArray();
                else if ("between" == e) {
                    var s = 0,
                        o = 0;
                    "pm_data.sales.date_of_last_sale" == t ? (s = a[0], o = a[1]) : (s = parseFloat(a[0]), o = parseFloat(a[1])), r = await DB.products.where(t).between(s, o, a[2], a[3]).limit(i).toArray()
                }
                return r = u(r), n = r.length, r
            }

            function u(t) {
                if (t.length > 0) switch (r.sort((function(t, e) {
                        return t.result_count - e.result_count
                    })), r.forEach((function(e) {
                        if (t.length > 0) {
                            if ("filter" == e.action && "all" != e.value) {
                                if ("marketplace" == e.property && (t = t.filter((function(t) {
                                        return t.marketplace == e.value
                                    }))), "productType" == e.property && (t = t.filter((function(t) {
                                        return t.productType.toLowerCase() == e.value.toLowerCase()
                                    }))), "status" == e.property && (t = t.filter((function(t) {
                                        return t.status.toLowerCase() == e.value.toLowerCase()
                                    }))), "pm_data.sales.has_sales" == e.property && (t = t.filter((function(t) {
                                        return t.pm_data.sales && t.pm_data.sales.has_sales && t.pm_data.sales.has_sales == e.value
                                    }))), "pm_data.availability.buyable" != e.property && "pm_data.availability.reason" != e.property || (t = t.filter((function(t) {
                                        return "pm_data.availability.buyable" == e.property ? t.pm_data.availability && t.pm_data.availability.buyable == e.value : "pm_data.availability.reason" == e.property ? t.pm_data.availability && t.pm_data.availability.reason == e.value : void 0
                                    }))), "pm_data.sales.total_net_sold" == e.property) {
                                    var a = parseFloat(e.value[0]),
                                        r = parseFloat(e.value[1]);
                                    a >= 0 && r >= 0 && (t = t.filter((function(t) {
                                        var s = !1,
                                            o = parseFloat(t.pm_data.sales.total_net_sold);
                                        return o && (1 == e.value[2] && 1 == e.value[3] ? s = o >= a && o <= r : 0 == e.value[2] && 1 == e.value[3] ? s = o > a && o <= r : 1 == e.value[2] && 0 == e.value[3] ? s = o >= a && o < r : 0 == e.value[2] && 0 == e.value[3] && (s = o > a && o < r)), s
                                    })))
                                }
                                if ("pm_data.sales.date_of_last_sale" == e.property) {
                                    var s = e.value[0],
                                        o = e.value[1];
                                    s && o && (t = t.filter((function(t) {
                                        var a = !1,
                                            r = t.pm_data.sales.date_of_last_sale;
                                        return r && (1 == e.value[2] && 1 == e.value[3] ? a = r >= s && r <= o : 0 == e.value[2] && 1 == e.value[3] ? a = r > s && r <= o : 1 == e.value[2] && 0 == e.value[3] ? a = r >= s && r < o : 0 == e.value[2] && 0 == e.value[3] && (a = r > s && r < o)), a
                                    })))
                                }
                                if ("estimatedExpirationDate" == e.property) {
                                    var n = parseFloat(e.value[0]),
                                        i = parseFloat(e.value[1]);
                                    n && i && (t = t.filter((function(t) {
                                        var a = !1;
                                        return t.estimatedExpirationDate && (1 == e.value[2] && 1 == e.value[3] ? a = t.estimatedExpirationDate >= n && t.estimatedExpirationDate <= i : 0 == e.value[2] && 1 == e.value[3] ? a = t.estimatedExpirationDate > n && t.estimatedExpirationDate <= i : 1 == e.value[2] && 0 == e.value[3] ? a = t.estimatedExpirationDate >= n && t.estimatedExpirationDate < i : 0 == e.value[2] && 0 == e.value[3] && (a = t.estimatedExpirationDate > n && t.estimatedExpirationDate < i)), "removed" != t.pm_data.status.toLowerCase() && "true" != t.pm_data.sales.has_sales && a
                                    })))
                                }
                                if ("listPrice" == e.property) {
                                    var l = parseFloat(parseFloat(e.value[0]).toFixed(2)),
                                        c = parseFloat(parseFloat(e.value[1]).toFixed(2));
                                    l && c && (t = t.filter((function(t) {
                                        var a = !1;
                                        return parseFloat(t.listPrice.toFixed(2)) && (1 == e.value[2] && 1 == e.value[3] ? a = t.listPrice >= l && t.listPrice <= c : 0 == e.value[2] && 1 == e.value[3] ? a = t.listPrice > l && t.listPrice <= c : 1 == e.value[2] && 0 == e.value[3] ? a = t.listPrice >= l && t.listPrice < c : 0 == e.value[2] && 0 == e.value[3] && (a = t.listPrice > l && t.listPrice < c)), a
                                    })))
                                }
                                if ("createdDate" == e.property) {
                                    n = parseFloat(e.value[0]), i = parseFloat(e.value[1]);
                                    n && i && (t = t.filter((function(t) {
                                        var a = !1;
                                        return t.createdDate && (1 == e.value[2] && 1 == e.value[3] ? a = t.createdDate >= n && t.createdDate <= i : 0 == e.value[2] && 1 == e.value[3] ? a = t.createdDate > n && t.createdDate <= i : 1 == e.value[2] && 0 == e.value[3] ? a = t.createdDate >= n && t.createdDate < i : 0 == e.value[2] && 0 == e.value[3] && (a = t.createdDate > n && t.createdDate < i)), a
                                    })))
                                }
                                if ("pm_data.reviews.review_score" == e.property) {
                                    var _ = parseFloat(e.value[0]),
                                        d = parseFloat(e.value[1]);
                                    t = t.filter((function(t) {
                                        var a = !1;
                                        return 1 == e.value[2] && 1 == e.value[3] ? a = t.pm_data.reviews.review_score >= _ && t.pm_data.reviews.review_score <= d : 0 == e.value[2] && 1 == e.value[3] ? a = t.pm_data.reviews.review_score > _ && t.pm_data.reviews.review_score <= d : 1 == e.value[2] && 0 == e.value[3] ? a = t.pm_data.reviews.review_score >= _ && t.pm_data.reviews.review_score < d : 0 == e.value[2] && 0 == e.value[3] && (a = t.pm_data.reviews.review_score > _ && t.pm_data.reviews.review_score < d), a
                                    }))
                                }
                                if ("pm_data.bsr.bsr_val_clean" == e.property) {
                                    var u = parseFloat(e.value[0]),
                                        p = parseFloat(e.value[1]);
                                    t = t.filter((function(t) {
                                        var a = !1;
                                        return t.pm_data.bsr && parseFloat(t.pm_data.bsr.bsr_val_clean) >= 0 && (1 == e.value[2] && 1 == e.value[3] ? a = t.pm_data.bsr.bsr_val_clean >= u && t.pm_data.bsr.bsr_val_clean <= p : 0 == e.value[2] && 1 == e.value[3] ? a = t.pm_data.bsr.bsr_val_clean > u && t.pm_data.bsr.bsr_val_clean <= p : 1 == e.value[2] && 0 == e.value[3] ? a = t.pm_data.bsr.bsr_val_clean >= u && t.pm_data.bsr.bsr_val_clean < p : 0 == e.value[2] && 0 == e.value[3] && (a = t.pm_data.bsr.bsr_val_clean > u && t.pm_data.bsr.bsr_val_clean < p)), a
                                    }))
                                }
                            }
                            if ("search_text" == e.action && "" != e.value) {
                                performance.now();
                                var m = e.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                                t = (t = t.filter((function(t) {
                                    var a = !1,
                                        r = "";
                                    return "all" != e.property && "asin" != e.property || (r += " " + (t.asin ? t.asin : "")), "all" != e.property && "brand" != e.property || (r += " " + (t.brandName ? t.brandName : "")), "all" != e.property && "title" != e.property || (r += " " + (t.productTitle ? t.productTitle : "")), "all" != e.property && "bullets" != e.property || (r += " " + (t.pm_data.product_texts.bullets ? t.pm_data.product_texts.bullets.join(" ") : "")), "all" != e.property && "description" != e.property || (r += " " + (t.pm_data.product_texts.description ? t.pm_data.product_texts.description : "")), -1 !== (r = r.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")).indexOf(m) && (a = !0), a
                                }))).map((function(t, a, r) {
                                    var s = e.value;
                                    s = s.replace(/(\s+)/, "(<[^>]+>)*$1(<[^>]+>)*");
                                    var o = new RegExp("(" + s + ")", "gi"),
                                        n = t.asin;
                                    if ("all" != e.property && "asin" != e.property || (n = n ? (n = n.replace(o, "<mark>$1</mark>")).replace(/(<mark>[^<>]*)((<[^>]+>)+)([^<>]*<\/mark>)/, "$1</mark>$2<mark>$4") : ""), "all" != e.property && "brand" != e.property || (t.brandName = t.brandName ? t.brandName.replace(o, "<mark>$1</mark>") : "", t.brandName = t.brandName ? t.brandName.replace(/(<mark>[^<>]*)((<[^>]+>)+)([^<>]*<\/mark>)/, "$1</mark>$2<mark>$4") : ""), "all" != e.property && "title" != e.property || (t.productTitle = t.productTitle ? t.productTitle.replace(o, "<mark>$1</mark>") : "", t.productTitle = t.productTitle ? t.productTitle.replace(/(<mark>[^<>]*)((<[^>]+>)+)([^<>]*<\/mark>)/, "$1</mark>$2<mark>$4") : ""), "all" == e.property || "bullets" == e.property) {
                                        var i = t.pm_data.product_texts.bullets ? t.pm_data.product_texts.bullets.join(" [split__here] ") : "";
                                        i = (i = i.replace(o, "<mark>$1</mark>")).replace(/(<mark>[^<>]*)((<[^>]+>)+)([^<>]*<\/mark>)/, "$1</mark>$2<mark>$4"), t.pm_data.product_texts.bullets = i.split(" [split__here] ")
                                    }
                                    return "all" != e.property && "description" != e.property || (t.pm_data.product_texts.description = t.pm_data.product_texts.description ? t.pm_data.product_texts.description.replace(o, "<mark>$1</mark>") : "", t.pm_data.product_texts.description = t.pm_data.product_texts.description ? t.pm_data.product_texts.description.replace(/(<mark>[^<>]*)((<[^>]+>)+)([^<>]*<\/mark>)/, "$1</mark>$2<mark>$4") : ""), t.pm_data.asin_with_markup = n, t
                                }));
                                performance.now()
                            }
                        }
                    })), a.sort_by) {
                    case "productTitle":
                        t = "desc" == a.direction ? t.sort((function(t, e) {
                            return e.productTitle.localeCompare(t.productTitle, {
                                ignorePunctuation: !0
                            })
                        })) : t.sort((function(t, e) {
                            return t.productTitle.localeCompare(e.productTitle, {
                                ignorePunctuation: !0
                            })
                        }));
                        break;
                    case "pm_data.product_type":
                        t = "desc" == a.direction ? t.sort((function(t, e) {
                            return e.pm_data.product_type.localeCompare(t.pm_data.product_type, {
                                ignorePunctuation: !0
                            })
                        })) : t.sort((function(t, e) {
                            return t.pm_data.product_type.localeCompare(e.pm_data.product_type, {
                                ignorePunctuation: !0
                            })
                        }));
                        break;
                    case "updatedDate":
                        t = "desc" == a.direction ? t.sort((function(t, e) {
                            return e.updatedDate - t.updatedDate
                        })) : t.sort((function(t, e) {
                            return t.updatedDate - e.updatedDate
                        }));
                        break;
                    case "createdDate":
                        t = "desc" == a.direction ? t.sort((function(t, e) {
                            return e.createdDate - t.createdDate
                        })) : t.sort((function(t, e) {
                            return t.createdDate - e.createdDate
                        }));
                        break;
                    case "listPrice":
                        t = "desc" == a.direction ? t.sort((function(t, e) {
                            return e.listPrice - t.listPrice
                        })) : t.sort((function(t, e) {
                            return t.listPrice - e.listPrice
                        }));
                        break;
                    case "pm_data.status":
                        t = "desc" == a.direction ? t.sort((function(t, e) {
                            return e.pm_data.status.localeCompare(t.pm_data.status, {
                                ignorePunctuation: !0
                            })
                        })) : t.sort((function(t, e) {
                            return t.pm_data.status.localeCompare(e.pm_data.status, {
                                ignorePunctuation: !0
                            })
                        }));
                        break;
                    case "pm_data.sales.total_net_sold":
                        t = "desc" == a.direction ? t.sort((function(t, e) {
                            return e.pm_data.sales.total_net_sold - t.pm_data.sales.total_net_sold
                        })) : t.sort((function(t, e) {
                            return t.pm_data.sales.total_net_sold - e.pm_data.sales.total_net_sold
                        }));
                        break;
                    case "pm_data.sales.total_royalties":
                        t = "desc" == a.direction ? t.sort((function(t, e) {
                            return e.pm_data.sales.total_royalties - t.pm_data.sales.total_royalties
                        })) : t.sort((function(t, e) {
                            return t.pm_data.sales.total_royalties - e.pm_data.sales.total_royalties
                        }));
                        break;
                    case "pm_data.sales.date_of_last_sale":
                        t = "desc" == a.direction ? t.sort((function(t, e) {
                            return e.pm_data.sales.date_of_last_sale.localeCompare(t.pm_data.sales.date_of_last_sale, {
                                ignorePunctuation: !0
                            })
                        })) : t.sort((function(t, e) {
                            return t.pm_data.sales.date_of_last_sale.localeCompare(e.pm_data.sales.date_of_last_sale, {
                                ignorePunctuation: !0
                            })
                        }));
                        break;
                    case "pm_data.reviews.num_of_reviews":
                        t = "desc" == a.direction ? t.sort((function(t, e) {
                            return e.pm_data.reviews.num_of_reviews - t.pm_data.reviews.num_of_reviews
                        })) : t.sort((function(t, e) {
                            return t.pm_data.reviews.num_of_reviews - e.pm_data.reviews.num_of_reviews
                        }));
                        break;
                    case "pm_data.bsr.bsr_val_clean":
                        t = "desc" == a.direction ? t.sort((function(t, e) {
                            return e.pm_data.bsr.bsr_val_clean - t.pm_data.bsr.bsr_val_clean
                        })) : t.sort((function(t, e) {
                            return t.pm_data.bsr.bsr_val_clean - e.pm_data.bsr.bsr_val_clean
                        }));
                        break;
                    case "estimatedExpirationDate":
                        t = "desc" == a.direction ? t.sort((function(t, e) {
                            return e.estimatedExpirationDate - t.estimatedExpirationDate
                        })) : t.sort((function(t, e) {
                            return t.estimatedExpirationDate - e.estimatedExpirationDate
                        }));
                        break;
                    default:
                        t = t.sort((function(t, e) {
                            return e.updatedDate - t.updatedDate
                        }))
                }
                return t
            }
        })).then((function() {})).catch((function(t) {})), results_callback = {
            results: s.slice(0, 500),
            is_filtered: o,
            filter_results_count: n
        }, e(results_callback)
    }))
}

function fetchProductDesignDetails(t, e) {
    var a = {},
        r = Math.floor(501 * Math.random() + 1e3),
        s = 1;

    function o() {
        "function" == typeof e && e(a)
    }
    waitForinitMain((function() {
        checkDesignerId((function(e) {
            if (t) {
                var n = new XMLHttpRequest,
                    i = "https://merch.amazon.com/api/productconfiguration/get?id=" + t;
                n.open("GET", i, !0), n.setRequestHeader("PrettyMerch", "true"), n.onreadystatechange = async function() {
                    if (4 == n.readyState) {
                        if (-1 === xml_success_responsees.indexOf(n.status) || n.responseURL.includes("/429")) return s >= 5 ? (a = {}, o()) : (++s, setTimeout((function() {
                            fetchProductDesignDetails(t, (function(t) {
                                try {
                                    a = structuredClone(t)
                                } catch (t) {}
                                o()
                            }))
                        }), 5e3)), !1;
                        if (-1 != n.responseText.indexOf("AuthenticationPortal")) checkLogIn();
                        else {
                            try {
                                a = JSON.parse(n.responseText)
                            } catch (t) {
                                a = {}
                            }
                            o()
                        }
                    }
                }, setTimeout((function() {
                    n.send()
                }), r)
            }
        }))
    }))
}

function fetchProductListingDetails(t, e, a, r, s) {
    if (r = r || 0, t && e && a) {
        var o = ".de" == a ? "?language=en_GB" : "?language=en_US",
            n = new XMLHttpRequest,
            i = "https://www.amazon" + a + "/dp/" + t + o;
        n.open("GET", i, !0), n.onreadystatechange = function() {
            4 == n.readyState && (n.responseText ? parseProductListing(n.responseText, e, (function(t) {
                l(t)
            })) : l(""))
        }, setTimeout((() => {
            n.send()
        }), r)
    } else l("");

    function l(t) {
        "function" == typeof s && s(t)
    }
}

function parseProductListing(t, e, a) {
    var r = new DOMParser,
        s = "";
    try {
        s = r.parseFromString(t, "text/html")
    } catch (t) {
        s = ""
    }
    var o = {
        brand: ""
    };
    $(s).find("#bylineInfo").length && (o.brand = $(s).find("#bylineInfo").text(), o.brand = o.brand ? o.brand.replace(/Brand|Marca|Marke|Merk|Marka|Marque|ブランド|:/gi, "").trim() : ""), o.name = "", $(s).find("#productTitle").length && (o.name = $(s).find("#productTitle").text(), o.name = o.name ? o.name.trim() : ""), o.bullet_points = [], $.each($(s).find("#feature-bullets ul li .a-list-item"), (function(t, e) {
        var a = $(e).text();
        a = a ? a.trim() : "", o.bullet_points.push(a)
    })), o.description = $(s).find("#productDescription").length ? $(s).find("#productDescription").text().trim() : "", o.price = {};
    $(s).find("#corePriceDisplay_desktop_feature_div .a-price-symbol").length && $(s).find("#corePriceDisplay_desktop_feature_div .a-price-symbol").text();
    var n = $(s).find("#corePriceDisplay_desktop_feature_div .a-price-whole").length ? $(s).find("#corePriceDisplay_desktop_feature_div .a-price-whole").text() : "",
        i = $(s).find("#corePriceDisplay_desktop_feature_div .a-price-fraction").length ? $(s).find("#corePriceDisplay_desktop_feature_div .a-price-fraction").text() : "";
    o.price.formatted = n + i, o.price.clean = o.price.formatted, o.availability = {
        buyable: "true",
        reason: ""
    }, "page not found" == $(s).find("title").text().trim().toLowerCase() ? (o.availability.buyable = "false", o.availability.reason = "dogs_page") : (($(s).find("#outOfStockBuyBox").length > 0 || $(s).find("#outOfStock").length > 0) && (o.availability.buyable = "false", o.availability.reason = "out_of_stock"), ["HOUSE_BRAND", "PREMIUM_BRAND", "RAGLAN", "VNECK", "ZIP_HOODIE", "STANDARD_PULLOVER_HOODIE", "PREMIUM_TSHIRT", "STANDARD_SWEATSHIRT", "STANDARD_TSHIRT", "STANDARD_LONG_SLEEVE", "TANK_TOP", "ATHLETIC_SHIRT"].indexOf(e) >= 0 && $(s).find("#variation_size_name").length <= 0 && $(s).find("#inline-twister-expander-content-size_name").length <= 0 && (o.availability.buyable = "false", o.availability.reason = "no_size_options")), o.listing_images = [];
    var l = $(s).find("#imgTagWrapperId img").length ? $(s).find("#imgTagWrapperId img").attr("src") : "";
    if (o.listing_images.push(parser_imgurl(l)), "POP_SOCKET" != e);
    else {
        var c = $(s).find("#altImages ul img"),
            _ = parser_imgurl($(c[2]).attr("src"), "popsocket");
        _.design_img = _.product_img, _.product_img = "", o.listing_images.push(_)
    }
    if (o.color_option_images = [], "POP_SOCKET" != e) {
        var d = $(s).find("#variation_color_name").find(".a-unordered-list").children();
        for (var u of d) {
            var p = parser_imgurl($(u).find("img").attr("src"));
            o.color_option_images.push(p)
        }
    }
    if (o.reviews = {}, $(s).find("#acrCustomerReviewText").length) {
        var m = $(s).find("#acrCustomerReviewText").text();
        m = (m = m.match(/\d/g)) ? m.join("") : 0, o.reviews.num_of_reviews = parseInt(m)
    }
    if ($(s).find('#reviewsMedley span[data-hook="rating-out-of-text"]').length) {
        var f = $(s).find('#reviewsMedley span[data-hook="rating-out-of-text"]').first().text(),
            g = null;
        f.includes(" ") || f.includes("，") ? (g = f.indexOf(" ") > -1 ? f.indexOf(" ") : f.indexOf("，"), f = f.substring(0, g)) : f.includes("星5") && (f = f.substring(5)), f = f ? f.trim().replace(",", ".") : 0, o.reviews.review_score = parseFloat(f)
    }
    o.bsr = {}, o.bsr.bsr_val_clean = 0, o.bsr.bsr_val = "0", o.bsr.bsr_category = "";
    var h = "";
    if ($(s).find("#SalesRank .zg_hrsr_item").length) {
        var y = $(s).find("#SalesRank .zg_hrsr_item").first();
        $(y).find(".zg_hrsr_rank").length && (h = $(y).find(".zg_hrsr_rank").text().trim()), $(y).find(".zg_hrsr_ladder").length && (h += " " + $(y).find(".zg_hrsr_ladder").text().trim())
    } else if ($(s).find("#detailBullets_feature_div").length) {
        var v = $(s).find("#detailBullets_feature_div + ul").find("span").first();
        h = v.text().trim()
    } else $(s).find("#productDetails_detailBullets_sections1").length && $.each($(s).find("#productDetails_detailBullets_sections1 tr"), (function(t, e) {
        if ($(e).html().includes("bestsellers")) {
            var a = $(e).find("td span").first();
            h = a.text().trim()
        }
    }));
    if ("" != h) {
        h = h.split(/\s/);
        for (var T = 0; T < h.length && (!h[T] || !h[T].includes("(")); ++T) {
            var O = h[T] ? h[T].match(/\d/g) : null;
            if (O) {
                if (o.bsr.bsr_val_clean = parseInt(O.join("")), o.bsr.bsr_val = o.bsr.bsr_val_clean.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), o.bsr.bsr_val = "#" + o.bsr.bsr_val, T < h.length - 1) {
                    for (var D = [], b = T + 2; b < h.length && !h[b].includes("(");) D.push(h[b]), ++b;
                    o.bsr.bsr_category = D.join(" ").trim()
                }
                T = h.length
            }
        }
    }
    o.amz_choice = !1, $(s).find("#acBadge_feature_div #a-popover-amazons-choice-popover").length && (o.amz_choice = !0), o.is_best_seller = !1, $(s).find("#zeitgeistBadge_feature_div .badge-wrapper").length && (o.is_best_seller = !0), a(o)
}

function parser_imgurl(t, e) {
    e = e || "default";
    var a = {},
        r = "";
    try {
        r = decodeURIComponent(t)
    } catch (t) {
        r = !1
    }
    if (r)
        if (a.img_type = r.substring(r.length - 3), "popsocket" != e) {
            var s = r.lastIndexOf("/"),
                o = s = (n = r.substring(s + 1)).indexOf(".");
            a.product_img = n.substring(0, o), s = n.indexOf(a.img_type), a.design_img = "", (s = (n = n.substring(0, s - 1)).lastIndexOf("|")) > -1 && (a.design_img = n.substring(s + 1))
        } else {
            var n;
            s = r.lastIndexOf("/"), o = s = (n = r.substring(s + 1)).indexOf(".");
            a.product_img = n.substring(0, o)
        } return a
}

function fetchProductImageByAsin(t, e, a, r) {
    marketplaces[e].marketplace_extension;
    var s = "SCMZZZZZZZ",
        o = "";
    switch (a) {
        case "vs":
            s = "SCTHUMBZZZ";
            break;
        case "sm":
            s = "SCTZZZZZZZ";
            break;
        case "md":
            s = "SCMZZZZZZZ";
            break;
        case "lg":
            s = "SCLZZZZZZZ";
            break;
        default:
            s = "SCMZZZZZZZ"
    }
    o = "usa" == e ? "http://images.amazon.com/images/P/" + t + ".01._" + s + "_.jpg" : "https://images-eu.ssl-images-amazon.com/images/P/" + t + ".01._" + s + "_.jpg";
    var n = new XMLHttpRequest;
    n.open("GET", o), n.responseType = "blob", n.onload = function(t) {
        ! function(t, e) {
            var a = new FileReader;
            a.onload = function() {
                var t = a.result;
                e(t)
            }, a.readAsDataURL(t)
        }(n.response, (function(t) {
            ! function(t) {
                "function" == typeof r && r(t)
            }(t)
        }))
    }, n.send()
}
async function fetchProductImageByListingId(t, e) {
    var a = moment().valueOf(),
        r = {
            requests: [],
            __type: "com.amazon.zmecontentassetlocator#AssetBulkUrlGetInput"
        };
    if (await DB.transaction("r", DB.products, (async function() {
            t.forEach((async function(t, e) {
                var s = {
                        assetType: "",
                        externalid: "",
                        id: "",
                        __type: "com.amazon.zmecontentassetlocator#AssetBulkUrlGetItem"
                    },
                    o = [],
                    n = "",
                    i = "",
                    l = await DB.products.where("listingId").equals(t.identifier).or("asin").equals(t.identifier).first();
                if (l) {
                    t.listingId = l.listingId, t.asin = l.asin;
                    var c = !0;
                    if (l.pm_data.image_location) {
                        var _ = new URL(l.pm_data.image_location).searchParams.get("expires");
                        a < _ && (c = !1, t.location = l.pm_data.image_location)
                    }
                    c && l.productImageUrn && "" != l.productImageUrn && (n = (o = l.productImageUrn.split(":")[2]).split("/")[0], i = o.split("/")[1], s.assetType = i + "_THUMBNAIL", s.externalid = l.listingId, "DRAFT" == l.status || "AMAZON_REJECTED" == l.status || "REVIEW" == l.status || "TRANSLATING" == l.status ? s.id = n : s.id = n + "_" + l.productType, r.requests.push(s))
                }
            }))
        })).then((function() {})).catch((function() {})), r.requests.length > 0) {
        let e = null,
            a = {
                url: "https://merch.amazon.com/api/ng-amazon/coral/com.amazon.zmecontentassetlocator.ZMEContentAssetLocatorService/AssetBulkUrlGet",
                payload: r,
                fetchType: "POST",
                progressContainer: null
            };
        await fetchData(a).then((function(t) {
            try {
                e = structuredClone(t)
            } catch (t) {}
        })).catch((function(t) {})), e && await DB.transaction("rw", DB.products, (async function() {
            Object.keys(e.urls).forEach((async function(a) {
                var r = await DB.products.get(a);
                r && (r.pm_data.image_location = e.urls[a].location, DB.products.put(r));
                for (var s = 0; s < t.length; ++s) t[s].listingId === a && (t[s].location = e.urls[a].location, s = t.length)
            }))
        })).then((function() {})).catch((function() {})), s()
    } else s();

    function s() {
        e(t)
    }
}

function getSalesCSV(t, e, a, r, s, o, n, i, l, c) {
    a = a || ["all"], r = r || !1, s = s || !1, o = o || 0, c = c || !1, n = void 0 === n || n, l = l || !1, i = i || !1;
    var _ = !0,
        d = {};
    waitForinitMain((async function() {
        if (loggedIn) {
            if (r) {
                var u = {
                    toggleProgressBar: !0,
                    container: r,
                    action: "show",
                    title: "Downloading Sales..."
                };
                updateTabs(u)
            }
            t = moment(t).startOf("day");
            var p = moment(t).startOf("day").format("YYYY-MM-DD"),
                m = moment(e).startOf("day").format("YYYY-MM-DD");
            e = moment(e).endOf("day");
            var f = moment(t).startOf("month"),
                g = moment(t).startOf("month").format("YYYY-MM-DD"),
                h = moment(e).endOf("month"),
                y = !1;
            t.valueOf() == beginning_of_time.valueOf() && e.valueOf() == moment().endOf("day") && (y = !0);
            var v = 1,
                T = Math.ceil(e.diff(t, "days", !0)),
                O = Math.ceil(h.diff(f, "months", !0)),
                D = "https://merch.amazon.com/api/reporting/purchases/report?";
            if (!n) {
                var b = 5,
                    w = setTimeout((function t() {
                        (b += 3) > 95 && (b = 50);
                        r && updateTabs(u = {
                            updateProgressBar: !0,
                            container: r,
                            title: "Clearing Database...",
                            percentComplete: b
                        });
                        w = setTimeout(t, 500)
                    }), 500);
                await DB.transaction("rw", DB.sales, (async function() {
                    await DB.sales.clear()
                })).then((function() {
                    clearTimeout(w)
                })).catch((function(t) {}))
            }
            var P = {
                summary_details: {
                    start_date: moment(t).startOf("day").valueOf(),
                    end_date: moment(e).startOf("day").valueOf(),
                    days_duration: T,
                    months_duration: O,
                    is_all_time: y,
                    result_container: s
                },
                grand_totals: {
                    total_sold: 0,
                    total_cancelled: 0,
                    net_sales: 0,
                    total_returned: 0
                },
                grand_variation_totals: {
                    productType: [],
                    fitType: [],
                    color: [],
                    size: []
                }
            };

            function C(t, e) {
                var s = t[e].start_date,
                    o = t[e].end_date,
                    n = new XMLHttpRequest,
                    i = D + "fromDate=" + s.valueOf() + "&toDate=" + o.valueOf();
                n.open("GET", i, !0), n.setRequestHeader("PrettyMerch", "true"), n.onreadystatechange = async function() {
                    if (4 == n.readyState) {
                        if (-1 === xml_success_responsees.indexOf(n.status) || n.responseURL.includes("/429")) {
                            if (v >= 5) checkLogIn();
                            else {
                                ++v;
                                var i = 6,
                                    l = setInterval((function() {
                                        i <= 0 ? (clearInterval(l), C(t, e)) : r && updateTabs({
                                            updateProgressBar: !0,
                                            container: r,
                                            title: "Conneciton Failed. Retrying in " + i + "s...",
                                            percentComplete: "hold"
                                        });
                                        i -= 1
                                    }), 1e3)
                            }
                            return !1
                        }
                        if (-1 != n.responseText.indexOf("AuthenticationPortal")) checkLogIn();
                        else {
                            var c = "";
                            try {
                                c = JSON.parse(n.responseText)
                            } catch (t) {
                                c = ""
                            }
                            if (0) {
                                var d = JSON.parse(n.responseText);
                                c = {}, Object.keys(marketplaces).forEach((function(t) {
                                    if (a.includes(t) && d[marketplaces[t].marketplace_id]) {
                                        c[marketplaces[t].marketplace_id] = [];
                                        for (var e = 0; e < d[marketplaces[t].marketplace_id].length; ++e)
                                            for (var r = 0; r < 50; ++r) c[marketplaces[t].marketplace_id].push(d[marketplaces[t].marketplace_id][e]);
                                        c[marketplaces[t].marketplace_id].length
                                    }
                                }))
                            }
                            if (r) updateTabs({
                                updateProgressBar: !0,
                                container: r,
                                title: "Downloading Sales...",
                                percentComplete: (e + 1) / t.length * 100
                            });
                            for (var u = [], p = Math.ceil(o.endOf("day").diff(s, "days", !0)), m = moment(s), f = 0; f < p; ++f) {
                                if (Math.ceil(moment().endOf("day").diff(m, "days", !0)) > 1) {
                                    var g = {
                                        sale_date: m.format("YYYY-MM-DD"),
                                        sales: []
                                    };
                                    Object.keys(marketplaces).forEach((function(t) {
                                        if (a.includes(t) && (g.sales[marketplaces[t].marketplace_id] = [], c[marketplaces[t].marketplace_id]))
                                            for (var e = 0; e < c[marketplaces[t].marketplace_id].length; ++e) c[marketplaces[t].marketplace_id][e].period.substring(0, 10) == g.sale_date && g.sales[marketplaces[t].marketplace_id].push(c[marketplaces[t].marketplace_id][e])
                                    })), u.push(g)
                                }
                                m.add(1, "days")
                            }
                            _ && u.length > 0 ? await DB.transaction("rw", DB.sales, (function() {
                                DB.sales.bulkPut(u).then((function() {}))
                            })).then((function() {})).catch((function(t) {})) : _ && u.length, R(c, (function() {
                                e < t.length - 1 ? (!1, C(t, e + 1)) : I()
                            }))
                        }
                    }
                }, setTimeout((function() {
                    n.send()
                }), 500 + Math.floor(500 * Math.random()))
            }

            function R(t, e) {
                var r = [];
                i ? Object.keys(t).forEach((function(e) {
                    d.hasOwnProperty(e) ? $.merge(d[e], t[e]) : d[e] = t[e]
                })) : Object.keys(t).forEach((function(e) {
                    var s = [];
                    Object.keys(marketplaces).forEach((function(o) {
                        a.includes(o) && e == marketplaces[o].marketplace_id && (s = t[e].filter((function(t, e, a) {
                            return t.sale_date = t.period.substring(0, 10), t.marketplace_code = marketplaces[o].country_code, t.marketplace_extension = marketplaces[o].marketplace_extension, t.currency_symbol = marketplaces[o].currency_symbol, customDiffInDays(p, t.sale_date) >= 0 && customDiffInDays(m, t.sale_date) <= 0
                        })), $.merge(r, s))
                    }))
                }));
                var s = 0,
                    o = 0;
                r.forEach((function(t, e, a) {
                    if (t.asin in P[t.marketplace_code].product_list ? (P[t.marketplace_code].product_list[t.asin].unitsSold += parseInt(t.unitsSold), P[t.marketplace_code].product_list[t.asin].unitsCancelled += parseInt(t.unitsCancelled), P[t.marketplace_code].product_list[t.asin].net_sold = P[t.marketplace_code].product_list[t.asin].unitsSold - P[t.marketplace_code].product_list[t.asin].unitsCancelled, P[t.marketplace_code].product_list[t.asin].unitsReturned += parseInt(t.unitsReturned), P[t.marketplace_code].product_list[t.asin].revenue.value += parseFloat(t.revenue.value), P[t.marketplace_code].product_list[t.asin].royalties.value += parseFloat(t.royalties.value), t.sale_date < P[t.marketplace_code].product_list[t.asin].date_of_first_sale && (P[t.marketplace_code].product_list[t.asin].date_of_first_sale = t.sale_date), t.sale_date > P[t.marketplace_code].product_list[t.asin].date_of_last_sale && (P[t.marketplace_code].product_list[t.asin].date_of_last_sale = t.sale_date)) : (t.pretty_productType = G_AMAZON_INTERNAL_FLAGS.product_flags[t.productType], t.net_sold = parseInt(t.unitsSold) - parseInt(t.unitsCancelled), t.date_of_first_sale = t.sale_date, t.date_of_last_sale = t.sale_date, t.variation_totals = {
                            productType: [],
                            fitType: [],
                            color: [],
                            size: []
                        }, P[t.marketplace_code].product_list[t.asin] = JSON.parse(JSON.stringify(t))), s = parseInt(t.unitsSold) - parseInt(t.unitsCancelled), P[t.marketplace_code].market_totals.total_sold += parseInt(t.unitsSold), P[t.marketplace_code].market_totals.total_cancelled += parseInt(t.unitsCancelled), P[t.marketplace_code].market_totals.net_sales = P[t.marketplace_code].market_totals.total_sold - P[t.marketplace_code].market_totals.total_cancelled, P[t.marketplace_code].market_totals.total_returned += parseInt(t.unitsReturned), P[t.marketplace_code].market_totals.total_revenue += parseFloat(t.revenue.value), P[t.marketplace_code].market_totals.total_royalties += parseFloat(t.royalties.value), P.grand_totals.total_sold += parseInt(t.unitsSold), P.grand_totals.total_cancelled += parseInt(t.unitsCancelled), P.grand_totals.net_sales = P.grand_totals.total_sold - P.grand_totals.total_cancelled, P.grand_totals.total_returned += parseInt(t.unitsReturned), Object.keys(P[t.marketplace_code].chart_data).forEach((function(e) {
                            o = "daily" == e ? customDiffInDays(p, t.sale_date) : customDiffInMonths(g, t.sale_date), P[t.marketplace_code].chart_data[e].soldData[o] ? (P[t.marketplace_code].chart_data[e].soldData[o] += parseInt(t.unitsSold), P[t.marketplace_code].chart_data[e].cancelledData[o] += parseInt(t.unitsCancelled), P[t.marketplace_code].chart_data[e].netSoldData[o] = P[t.marketplace_code].chart_data[e].soldData[o] - P[t.marketplace_code].chart_data[e].cancelledData[o], P[t.marketplace_code].chart_data[e].returnedData[o] += parseInt(t.unitsReturned), P[t.marketplace_code].chart_data[e].revenueData[o] += parseFloat(t.revenue.value), P[t.marketplace_code].chart_data[e].royaltiesData[o] += parseFloat(t.royalties.value)) : (P[t.marketplace_code].chart_data[e].soldData[o] = parseInt(t.unitsSold), P[t.marketplace_code].chart_data[e].cancelledData[o] = parseInt(t.unitsCancelled), P[t.marketplace_code].chart_data[e].netSoldData[o] = P[t.marketplace_code].chart_data[e].soldData[o] - P[t.marketplace_code].chart_data[e].cancelledData[o], P[t.marketplace_code].chart_data[e].returnedData[o] = parseInt(t.unitsReturned), P[t.marketplace_code].chart_data[e].revenueData[o] = parseFloat(t.revenue.value), P[t.marketplace_code].chart_data[e].royaltiesData[o] = parseFloat(t.royalties.value))
                        })), s > 0) {
                        var r = G_AMAZON_INTERNAL_FLAGS.product_flags[t.productType].replace(/\s+/g, "_").toLowerCase(),
                            n = t.variationInfo.fit,
                            i = t.variationInfo.size,
                            l = t.variationInfo.color,
                            c = -1;
                        r && ((c = P[t.marketplace_code].product_list[t.asin].variation_totals.productType.findIndex((function(t) {
                            return t.variation == r
                        }))) > -1 ? P[t.marketplace_code].product_list[t.asin].variation_totals.productType[c].total += s : P[t.marketplace_code].product_list[t.asin].variation_totals.productType.push({
                            variation: r,
                            total: s
                        }), (c = P[t.marketplace_code].variation_totals.productType.findIndex((function(t) {
                            return t.variation == r
                        }))) > -1 ? P[t.marketplace_code].variation_totals.productType[c].total += s : P[t.marketplace_code].variation_totals.productType.push({
                            variation: r,
                            total: s
                        }), (c = P.grand_variation_totals.productType.findIndex((function(t) {
                            return t.variation == r
                        }))) > -1 ? P.grand_variation_totals.productType[c].total += s : P.grand_variation_totals.productType.push({
                            variation: r,
                            total: s
                        })), "POP_SOCKET" != t.productType && (n && ((c = P[t.marketplace_code].product_list[t.asin].variation_totals.fitType.findIndex((function(t) {
                            return t.variation == n
                        }))) > -1 ? P[t.marketplace_code].product_list[t.asin].variation_totals.fitType[c].total += s : P[t.marketplace_code].product_list[t.asin].variation_totals.fitType.push({
                            variation: n,
                            total: s
                        }), (c = P[t.marketplace_code].variation_totals.fitType.findIndex((function(t) {
                            return t.variation == n
                        }))) > -1 ? P[t.marketplace_code].variation_totals.fitType[c].total += s : P[t.marketplace_code].variation_totals.fitType.push({
                            variation: n,
                            total: s
                        }), (c = P.grand_variation_totals.fitType.findIndex((function(t) {
                            return t.variation == n
                        }))) > -1 ? P.grand_variation_totals.fitType[c].total += s : P.grand_variation_totals.fitType.push({
                            variation: n,
                            total: s
                        })), i && ((c = P[t.marketplace_code].product_list[t.asin].variation_totals.size.findIndex((function(t) {
                            return t.variation == i
                        }))) > -1 ? P[t.marketplace_code].product_list[t.asin].variation_totals.size[c].total += s : P[t.marketplace_code].product_list[t.asin].variation_totals.size.push({
                            variation: i,
                            total: s
                        }), (c = P[t.marketplace_code].variation_totals.size.findIndex((function(t) {
                            return t.variation == i
                        }))) > -1 ? P[t.marketplace_code].variation_totals.size[c].total += s : P[t.marketplace_code].variation_totals.size.push({
                            variation: i,
                            total: s
                        }), (c = P.grand_variation_totals.size.findIndex((function(t) {
                            return t.variation == i
                        }))) > -1 ? P.grand_variation_totals.size[c].total += s : P.grand_variation_totals.size.push({
                            variation: i,
                            total: s
                        })), l && ((c = P[t.marketplace_code].product_list[t.asin].variation_totals.color.findIndex((function(t) {
                            return t.variation == l
                        }))) > -1 ? P[t.marketplace_code].product_list[t.asin].variation_totals.color[c].total += s : P[t.marketplace_code].product_list[t.asin].variation_totals.color.push({
                            variation: l,
                            total: s
                        }), (c = P[t.marketplace_code].variation_totals.color.findIndex((function(t) {
                            return t.variation == l
                        }))) > -1 ? P[t.marketplace_code].variation_totals.color[c].total += s : P[t.marketplace_code].variation_totals.color.push({
                            variation: l,
                            total: s
                        }), (c = P.grand_variation_totals.color.findIndex((function(t) {
                            return t.variation == l
                        }))) > -1 ? P.grand_variation_totals.color[c].total += s : P.grand_variation_totals.color.push({
                            variation: l,
                            total: s
                        })))
                    }
                })), "function" == typeof e && e()
            }

            function I() {
                if (i) N(d);
                else {
                    if (r) updateTabs({
                        updateProgressBar: !0,
                        container: r,
                        title: "Download Complete...",
                        percentComplete: 100
                    });
                    Object.keys(marketplaces).forEach((function(t) {
                        if (a.includes(t)) {
                            var e = [];
                            for (let [a, r] of Object.entries(P[t].product_list)) e.push(JSON.parse(JSON.stringify(r))), r = "";
                            P[t].product_list = [], P[t].product_list = e
                        }
                    }));
                    var t = {
                            daily: [],
                            monthly: []
                        },
                        s = {
                            daily: 0,
                            monthly: 0
                        };
                    if (Object.keys(marketplaces).forEach((function(e, r) {
                            a.includes(e) && Object.keys(P[e].chart_data).forEach((function(a) {
                                var s = !1;
                                P[e].chart_data[a].datesData.forEach((function(o, n, i) {
                                    null == P[e].chart_data[a].soldData[n] ? (P[e].chart_data[a].soldData[n] = 0, P[e].chart_data[a].cancelledData[n] = 0, P[e].chart_data[a].netSoldData[n] = 0, P[e].chart_data[a].returnedData[n] = 0, P[e].chart_data[a].revenueData[n] = 0, P[e].chart_data[a].royaltiesData[n] = 0) : s || (s = !0, t[a][r] = n)
                                }))
                            }))
                        })), y) {
                        t.daily = t.daily.sort((function(t, e) {
                            return t - e
                        })), t.monthly = t.monthly.sort((function(t, e) {
                            return t - e
                        })), s.daily = t.daily[0], s.monthly = t.monthly[0], Object.keys(marketplaces).forEach((function(t) {
                            a.includes(t) && Object.keys(P[t].chart_data).forEach((function(e) {
                                P[t].chart_data[e].datesData.splice(0, s[e]), P[t].chart_data[e].soldData.splice(0, s[e]), P[t].chart_data[e].cancelledData.splice(0, s[e]), P[t].chart_data[e].netSoldData.splice(0, s[e]), P[t].chart_data[e].returnedData.splice(0, s[e]), P[t].chart_data[e].revenueData.splice(0, s[e]), P[t].chart_data[e].royaltiesData.splice(0, s[e])
                            }))
                        }));
                        var o = moment(P[a[0]].chart_data.daily.datesData[0]).startOf("day"),
                            n = moment(e).endOf("day"),
                            l = moment(o).startOf("month"),
                            c = moment(n).endOf("month"),
                            _ = Math.ceil(n.diff(o, "days", !0)),
                            u = Math.ceil(c.diff(l, "months", !0));
                        P.summary_details.start_date = moment(o).startOf("day").valueOf(), P.summary_details.end_date = moment(n).startOf("day").valueOf(), P.summary_details.days_duration = _, P.summary_details.months_duration = u
                    }
                    if (r) updateTabs({
                        toggleProgressBar: !0,
                        container: r,
                        action: "hide",
                        title: ""
                    });
                    N(P)
                }
            }

            function S(t, e, a) {
                var r = [];
                t = t.format("YYYY-MM-DD");
                for (var s = 0; s < e; ++s) r[s] = customAddToDate(t, s, "daily" == a ? "days" : "months");
                return r
            }

            function N(t) {
                "function" == typeof c && c(t)
            }
            "all" == a[0] && (a = [], Object.keys(marketplaces).forEach((function(t) {
                a.push(t)
            }))), Object.keys(marketplaces).forEach((function(e) {
                a.includes(e) ? (D += "marketplaceId=" + marketplaces[e].marketplace_id + "&", P[e] = {
                    marketplace_info: jQuery.extend(!0, {}, marketplaces[e]),
                    product_list: {},
                    variation_totals: {
                        productType: [],
                        fitType: [],
                        color: [],
                        size: []
                    },
                    market_totals: {
                        currency_symbol: marketplaces[e].currency_symbol,
                        total_sold: 0,
                        total_cancelled: 0,
                        net_sales: 0,
                        total_returned: 0,
                        total_revenue: 0,
                        total_royalties: 0
                    },
                    chart_data: {
                        daily: {
                            datesData: S(t, T, "daily"),
                            soldData: [],
                            cancelledData: [],
                            netSoldData: [],
                            returnedData: [],
                            revenueData: [],
                            royaltiesData: []
                        },
                        monthly: {
                            datesData: S(f, O, "monthly"),
                            soldData: [],
                            cancelledData: [],
                            netSoldData: [],
                            returnedData: [],
                            revenueData: [],
                            royaltiesData: []
                        }
                    }
                }) : _ = !1
            })), setTimeout((async function() {
                r && updateTabs({
                    updateProgressBar: !0,
                    container: r,
                    title: "Downloading Sales...",
                    percentComplete: 10
                });
                var a = moment(t),
                    s = a.format("YYYY-MM-DD"),
                    o = moment(e),
                    n = T;
                if (l) n = 0, R(l, (function() {
                    I()
                }));
                else if (await DB.transaction("r", DB.sales, (async function() {
                        for (var t = 0; t < T; ++t) {
                            var e = await DB.sales.get(s);
                            e ? (R(e.sales), s = customAddToDate(s, 1, "days"), --n, e = "") : t = T
                        }
                    })).then((function() {})).catch((function() {})), a = moment(s), n > 0) {
                    var i = [],
                        c = Math.ceil(n / 90);
                    for (k = 0; k < c; k++) {
                        Math.ceil(e.diff(a, "days", !0)) > 90 ? (o = moment(a)).add(89, "days").endOf("day") : o = moment(e);
                        var _ = {
                            start_date: a.startOf("day"),
                            end_date: o.startOf("day")
                        };
                        i.push(_), a = moment(o).add(1, "days").startOf("day")
                    }
                    C(i, 0)
                } else I()
            }), o)
        }
    }))
}

function customAddToDate(t, e, a) {
    e = parseInt(e), t = t.split("-");
    var r = new Date(t[0], t[1] - 1, t[2]);
    if (isInt(e)) {
        "days" == a ? r.setDate(r.getDate() + e) : "months" == a && r.setMonth(r.getMonth() + e);
        var s = r.getDate() < 10 ? "0" + r.getDate() : r.getDate(),
            o = r.getMonth() + 1 < 10 ? "0" + (r.getMonth() + 1) : r.getMonth() + 1;
        return r.getFullYear() + "-" + o + "-" + s
    }
}

function customDiffInMonths(t, e) {
    var a;
    return t = t.split("-"), e = e.split("-"), t = new Date(t[0], t[1] - 1, t[2]), a = 12 * ((e = new Date(e[0], e[1] - 1, e[2])).getFullYear() - t.getFullYear()), a -= t.getMonth(), (a += e.getMonth()) <= 0 ? 0 : a
}

function customDiffInDays(t, e) {
    t = t.split("-"), e = e.split("-"), t = new Date(t[0], t[1] - 1, t[2]), e = new Date(e[0], e[1] - 1, e[2]);
    const a = Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()),
        r = Date.UTC(e.getFullYear(), e.getMonth(), e.getDate());
    return Math.floor((r - a) / 864e5)
}

function getDailySales(t, e, a, r, s) {
    if (loggedIn) {
        r = r || 0;
        if (a) updateTabs({
            toggleProgressBar: !0,
            container: a,
            action: "show",
            title: "Downloading Sales..."
        });
        moment().startOf("day");
        var o, n = t.format("M/DD/YY") + " - " + e.format("M/DD/YY"),
            i = 0,
            l = 0,
            c = 0,
            _ = 0,
            d = 0,
            u = 0,
            p = [],
            m = [],
            f = [],
            g = [],
            h = [],
            y = [],
            v = [],
            T = selected_marketplace.country_code,
            O = [],
            D = 0,
            b = 0,
            w = Math.ceil(e.diff(t, "days", !0));
        w -= 1, setTimeout((function() {
            var t = 0;
            for (k = w; k >= 0; k--) o = w - k, D += 1, b += 1,
                function(t) {
                    var a = moment(e).subtract(k, "days");
                    v[t] = a.format("YYYY-MM-DD"), r(t, a, a)
                }(o);

            function r(e, r, o) {
                var w, k = Math.floor(201 * Math.random() + 150);
                O[e] = new XMLHttpRequest, w = "https://merch.amazon.com/api/reporting/purchases/records?marketplaceId=" + selected_marketplace.marketplace_id + "&fromDate=" + r.valueOf() + "&toDate=" + o.valueOf(), O[e].open("GET", w, !0), O[e].setRequestHeader("PrettyMerch", "true"), O[e].onreadystatechange = function() {
                    if (4 == O[e].readyState) {
                        if (-1 === xml_success_responsees.indexOf(O[e].status)) return checkLogIn(), !1;
                        if (-1 != O[e].responseText.indexOf("AuthenticationPortal")) checkLogIn();
                        else {
                            var t = JSON.parse(O[e].responseText),
                                r = 0,
                                o = 0,
                                w = 0,
                                k = 0,
                                P = 0,
                                C = 0,
                                R = {};
                            if (Object.keys(t).forEach((function(e) {
                                    R = JSON.parse(JSON.stringify(t[e][selected_marketplace.marketplace_id][0])), r += parseInt(R.unitsSold), o += parseInt(R.unitsCancelled), w += parseInt(R.unitsReturned), P += parseFloat(R.revenue.value), C += parseFloat(R.royalties.value)
                                })), i += r, l += o, c += w, _ += k += r - o, d += P, u += C, p[e] = r, m[e] = o, f[e] = w, g[e] = k, h[e] = P, y[e] = C, D += -1, a) updateTabs({
                                updateProgressBar: !0,
                                container: a,
                                percentComplete: (b - D) / b * 100
                            });
                            0 == D && function() {
                                if (a) {
                                    updateTabs({
                                        toggleProgressBar: !0,
                                        container: a,
                                        action: "hide",
                                        title: ""
                                    })
                                }
                                var t = {};
                                t[T] = {
                                        currency_symbol: selected_marketplace.currency_symbol,
                                        titleDate: n,
                                        totalSold: i,
                                        totalCancelled: l,
                                        totalReturned: c,
                                        totalNetSold: _,
                                        totalRevenue: d,
                                        totalRoyalties: u,
                                        soldData: p,
                                        cancelledData: m,
                                        returnedData: f,
                                        netSoldData: g,
                                        revenueData: h,
                                        royaltiesData: y,
                                        datesData: v
                                    },
                                    function(t) {
                                        "function" == typeof s && s(t)
                                    }(t)
                            }()
                        }
                    }
                }, setTimeout((function() {
                    O[e].send()
                }), t), t += k
            }
        }), r)
    }
}

function getAllTimeSalesStats(t, e, a, r) {
    a = a || 0, e = e || !1;
    var s = beginning_of_time.valueOf(),
        o = moment().startOf("day").valueOf(),
        n = selected_marketplace.country_code;
    getSalesCSV(s, o, [n], e, "", a, t, !1, !1, (function(t) {
        var a = {
            currency_symbol: selected_marketplace.currency_symbol,
            net_sales: t[n].market_totals.net_sales,
            total_cancelled: t[n].market_totals.total_cancelled,
            total_returned: t[n].market_totals.total_returned,
            total_revenue: t[n].market_totals.total_revenue,
            total_royalties: t[n].market_totals.total_royalties,
            total_sales: t[n].market_totals.total_sold,
            product_list: t[n].product_list || [],
            variation_totals: t[n].variation_totals || {},
            result_container: e,
            title_date: "All Time"
        };
        "function" == typeof r && r(a)
    }))
}
async function getAllTimeSalesSummary(t, e) {
    e = e || 0;
    var a = beginning_of_time.valueOf(),
        r = moment().startOf("day").valueOf(),
        s = selected_marketplace.country_code;
    await DB.transaction("r", DB.app_data, (async function() {
        var e = await DB.app_data.get("force_refresh_sales");
        e && "true" == e.value && (t = !1)
    })).catch((function(t) {})), t || await DB.transaction("rw", DB.app_data, (async function() {
        await DB.app_data.delete("last_all_time_sales_update"), await DB.app_data.delete("last_product_list_sales_merge"), await DB.app_data.delete("force_refresh_sales")
    })).catch((function(t) {})), getSalesCSV(a, r, ["all"], ".sales-summary.all-time", "", e, t, !1, !1, (async function(t) {
        await DB.transaction("rw", DB.app_data, (async function() {
            var t = {
                title: "last_all_time_sales_update",
                date: moment().startOf("day").valueOf()
            };
            await DB.app_data.put(t)
        })).catch((function(t) {})), updateTabs({
            update: "allTimeSalesSummary",
            data: t[s].market_totals
        })
    }))
}

function getAllTimeSales(t, e, a, r) {
    a = a || 0;
    var s = moment().startOf("day"),
        o = beginning_of_time.valueOf(),
        n = moment(s).subtract(3, "months").endOf("month").startOf("day").valueOf(),
        i = logged_in_user + "_beg_to_3mo_ago_" + selected_marketplace.country_code + "_" + o + "-" + n;

    function l(t) {
        "function" == typeof r && r(t)
    }
    chrome.storage.local.get(i, (function(r) {
        if (t && void 0 !== r[i] && "" != r[i]) {
            var o = jQuery.extend(!0, {}, r[i]);
            getMonthlySales(moment(s).subtract(2, "months").startOf("month"), s, t, e, a, (function(t) {
                o.titleDate = moment(beginning_of_time).format("M/D/YY") + " - " + moment(s).format("M/D/YY"), o.totalSold += t.totalSold, o.totalCancelled += t.totalCancelled, o.totalReturned += t.totalReturned, o.totalNetSold += t.totalNetSold, o.totalRevenue += t.totalRevenue, o.totalRoyalties += t.totalRoyalties;
                for (var e = o.soldData.length, a = 0; a < t.soldData.length; ++a) o.soldData[e + a] = t.soldData[a], o.cancelledData[e + a] = t.cancelledData[a], o.returnedData[e + a] = t.returnedData[a], o.netSoldData[e + a] = t.netSoldData[a], o.revenueData[e + a] = t.revenueData[a], o.royaltiesData[e + a] = t.royaltiesData[a], o.datesData[e + a] = moment(t.datesData[a]).format("YYYY-MM-DD"), o.sales_listData[e + a] = t.sales_listData[a];
                l(o)
            }))
        } else getMonthlySales(beginning_of_time, s, t, e, a, (function(t) {
            l(t)
        }))
    }))
}

function getMonthlySales(t, e, a, r, s, o) {
    if (loggedIn) {
        s = s || 0;
        if (r) updateTabs({
            toggleProgressBar: !0,
            container: r,
            action: "show",
            title: "Downloading Sales..."
        });
        e = moment(e).endOf("month");
        var n = moment().startOf("day"),
            i = t.format("m/d/yy") + " - " + e.format("m/d/yy"),
            l = moment(t).startOf("month").valueOf(),
            c = moment(e).endOf("month").startOf("day").valueOf(),
            _ = moment(beginning_of_time).valueOf(),
            d = moment(n).subtract(3, "months").endOf("month").startOf("day").valueOf(),
            u = 0;
        l == _ && c > d && (u = Math.ceil(moment(d).diff(beginning_of_time, "months", !0)));
        var p, m = 0,
            f = 0,
            g = 0,
            h = 0,
            y = 0,
            v = 0,
            T = [],
            O = [],
            D = [],
            b = [],
            w = [],
            P = [],
            C = [],
            R = selected_marketplace.currency_symbol,
            I = [],
            S = [],
            N = [],
            U = 0,
            A = 0,
            L = Math.ceil(e.diff(t, "months", !0));
        L -= 1, setTimeout((function() {
            var t = 0;
            for (k = L; k >= 0; k--) p = L - k, U += 1, A += 1,
                function(t) {
                    var o = L - t,
                        i = moment(e).subtract(k, "months"),
                        l = moment(i).startOf("month"),
                        c = moment(i).endOf("month").startOf("day");
                    C[t] = l.format("YYYY-MM-DD");
                    var _ = logged_in_user + "_sales_" + selected_marketplace.country_code + "_" + l.valueOf() + "-" + c.valueOf();
                    a && o > 2 ? chrome.storage.local.get(_, (function(e) {
                        if (void 0 !== e[_] && "" != e[_]) {
                            if (m += e[_].total_sold, f += e[_].total_cancelled, g += e[_].total_returned, h += e[_].total_net_sold, y += e[_].total_revenue, v += e[_].total_royalties, T[t] = e[_].total_sold, O[t] = e[_].total_cancelled, D[t] = e[_].total_returned, b[t] = e[_].total_net_sold, w[t] = e[_].total_revenue, P[t] = e[_].total_royalties, I[t] = e[_].sales_list, combineSalesLists(S, I[t], (function(t) {
                                    S = jQuery.extend(!0, {}, t)
                                })), U += -1, r) updateTabs({
                                updateProgressBar: !0,
                                container: r,
                                percentComplete: (A - U) / A * 100
                            });
                            0 == U && n()
                        } else s(t, l, c, _)
                    })) : s(t, l, c, _)
                }(p);

            function s(e, a, s, o) {
                var i, l = Math.floor(201 * Math.random() + 150);
                N[e] = new XMLHttpRequest, i = "https://merch.amazon.com/api/reporting/purchases/records?marketplaceId=" + selected_marketplace.marketplace_id + "&fromDate=" + a.valueOf() + "&toDate=" + s.valueOf(), N[e].open("GET", i, !0), N[e].setRequestHeader("PrettyMerch", "true"), N[e].onreadystatechange = function() {
                    if (4 == N[e].readyState) {
                        if (-1 === xml_success_responsees.indexOf(N[e].status)) return checkLogIn(), !1;
                        if (-1 != N[e].responseText.indexOf("AuthenticationPortal")) checkLogIn();
                        else {
                            var t = JSON.parse(N[e].responseText),
                                a = 0,
                                s = 0,
                                i = 0,
                                l = 0,
                                c = 0,
                                _ = 0,
                                d = [],
                                u = 0,
                                p = {};
                            Object.keys(t).forEach((function(e) {
                                p = JSON.parse(JSON.stringify(t[e][selected_marketplace.marketplace_id][0])), a += parseInt(p.unitsSold), s += parseInt(p.unitsCancelled), i += parseInt(p.unitsReturned), c += parseFloat(p.revenue.value), _ += parseFloat(p.royalties.value), p.marketplace_extension = selected_marketplace.marketplace_extension, p.currency_symbol = selected_marketplace.currency_symbol, p.net_sold = p.unitsSold - p.unitsCancelled, d[u] = p, ++u
                            })), l += a - s, findVariationTotals(d, (function(t) {
                                (d = t, m += a, f += s, g += i, h += l, y += c, v += _, T[e] = a, O[e] = s, D[e] = i, b[e] = l, w[e] = c, P[e] = _, I[e] = d, combineSalesLists(S, I[e], (function(t) {
                                    S = jQuery.extend(!0, {}, t)
                                })), U += -1, r) && updateTabs({
                                    updateProgressBar: !0,
                                    container: r,
                                    percentComplete: (A - U) / A * 100
                                });
                                if (0 == U && n(), currentMonthSales = {
                                        total_sold: a,
                                        total_cancelled: s,
                                        total_returned: i,
                                        total_net_sold: l,
                                        total_revenue: c,
                                        total_royalties: _,
                                        sales_list: d
                                    }, logged_in_user) {
                                    var u = {};
                                    u[o] = currentMonthSales, chrome.storage.local.set(u)
                                }
                            }))
                        }
                    }
                }, setTimeout((function() {
                    N[e].send()
                }), t), t += l
            }

            function n() {
                if (0) {
                    for (var t = 0, e = 0, a = 0, s = 0, n = 0, l = 0, c = [], p = [], k = [], N = [], U = [], A = [], L = [], G = [], E = 0; E < u; ++E) t += T[E], e += O[E], a += D[E], s += b[E], n += w[E], l += P[E], c[E] = T[E], p[E] = O[E], k[E] = D[E], N[E] = b[E], U[E] = w[E], A[E] = P[E], G[E] = C[E], L[E] = I[E];
                    var x = {
                        totalSold: t,
                        totalCancelled: e,
                        totalReturned: a,
                        totalNetSold: s,
                        totalRevenue: n,
                        totalRoyalties: l,
                        soldData: c,
                        cancelledData: p,
                        returnedData: k,
                        netSoldData: N,
                        revenueData: U,
                        royaltiesData: A,
                        datesData: G,
                        sales_listData: L
                    };
                    if (logged_in_user) {
                        var M = {};
                        M[logged_in_user + "_beg_to_3mo_ago_" + _ + "-" + d] = x, chrome.storage.local.set(M)
                    }
                }
                var B = {
                    titleDate: i,
                    totalSold: m,
                    totalCancelled: f,
                    totalReturned: g,
                    totalNetSold: h,
                    totalRevenue: y,
                    totalRoyalties: v,
                    soldData: T,
                    cancelledData: O,
                    returnedData: D,
                    netSoldData: b,
                    revenueData: w,
                    royaltiesData: P,
                    currency_symbol: R,
                    datesData: C,
                    sales_listData: I,
                    combined_sales_listData: S
                };
                r && updateTabs({
                    toggleProgressBar: !0,
                    container: r,
                    action: "hide",
                    title: ""
                });
                ! function(t) {
                    "function" == typeof o && o(t)
                }(B)
            }
        }), s)
    }
}

function findVariationTotals(t, e) {
    var a = {},
        r = {},
        s = 0;
    a.product_list = [], a.variation_totals = {}, a.variation_totals.fitType = [], a.variation_totals.color = [], a.variation_totals.size = [], a.variation_totals.productType = [];
    for (var o = {}, n = {}, l = {}, c = {}, _ = 0; _ < t.length; ++_) {
        (r = jQuery.extend(!0, {}, t[_])).variation_totals = {}, r.variation_totals.fitType = [], r.variation_totals.color = [], r.variation_totals.size = [], r.variation_totals.productType = [], r.pretty_productType = G_AMAZON_INTERNAL_FLAGS.product_flags[r.productType];
        var d = {},
            u = {},
            p = {},
            m = {};
        if (r.net_sold > 0 || r.unitsReturned > 0) {
            if ("POP_SOCKET" == r.productType) m.popsockets = r.net_sold, c.popsockets = (c.popsockets ? c.popsockets : 0) + r.net_sold;
            else
                for (i = 0; i < r.salesAggregateForVariations.length; i++) {
                    var f = r.salesAggregateForVariations[i].unitsSold - r.salesAggregateForVariations[i].unitsCancelled;
                    if (f > 0) {
                        if (r.salesAggregateForVariations[i].variationInfo.fit) {
                            var g = r.salesAggregateForVariations[i].variationInfo.fit.replace(/\s+/g, "_").toLowerCase();
                            d[g] = (d[g] ? d[g] : 0) + f, o[g] = (o[g] ? o[g] : 0) + f
                        }
                        if (r.salesAggregateForVariations[i].variationInfo.color) {
                            var h = r.salesAggregateForVariations[i].variationInfo.color.replace(/\s+/g, "_").toLowerCase();
                            u[h] = (u[h] ? u[h] : 0) + f, l[h] = (l[h] ? l[h] : 0) + f
                        }
                        if (r.salesAggregateForVariations[i].variationInfo.size) {
                            var y = r.salesAggregateForVariations[i].variationInfo.size.replace(/\s+/g, "_").toLowerCase();
                            p[y] = (p[y] ? p[y] : 0) + f, n[y] = (n[y] ? n[y] : 0) + f
                        }
                        var v = r.pretty_productType.replace(/\s+/g, "_").toLowerCase();
                        m[v] = (m[v] ? m[v] : 0) + f, c[v] = (c[v] ? c[v] : 0) + f
                    }
                }
            Object.keys(d).forEach((function(t) {
                r.variation_totals.fitType.push({
                    variation: t,
                    total: d[t]
                })
            })), Object.keys(u).forEach((function(t) {
                r.variation_totals.color.push({
                    variation: t,
                    total: u[t]
                })
            })), Object.keys(p).forEach((function(t) {
                r.variation_totals.size.push({
                    variation: t,
                    total: p[t]
                })
            })), Object.keys(m).forEach((function(t) {
                r.variation_totals.productType.push({
                    variation: t,
                    total: m[t]
                })
            })), delete r.salesAggregateForVariations, a.product_list[s] = jQuery.extend(!0, {}, r), ++s
        }
    }
    Object.keys(o).forEach((function(t) {
        a.variation_totals.fitType.push({
            variation: t,
            total: o[t]
        })
    })), Object.keys(l).forEach((function(t) {
        a.variation_totals.color.push({
            variation: t,
            total: l[t]
        })
    })), Object.keys(n).forEach((function(t) {
        a.variation_totals.size.push({
            variation: t,
            total: n[t]
        })
    })), Object.keys(c).forEach((function(t) {
        a.variation_totals.productType.push({
            variation: t,
            total: c[t]
        })
    })), "function" == typeof e && e(a)
}

function combineSalesLists(t, e, a) {
    var r = 0,
        s = 0,
        o = 0,
        n = 0,
        i = !1,
        l = !1;
    if (e.product_list && e.product_list.length)
        if (t.product_list && t.product_list.length) {
            for (r = 0; r < e.product_list.length; ++r) {
                for (i = !1, s = 0; s < t.product_list.length; ++s) e.product_list[r].asin == t.product_list[s].asin && (t.product_list[s].net_sold += e.product_list[r].net_sold, t.product_list[s].unitsSold += e.product_list[r].unitsSold, t.product_list[s].unitsCancelled += e.product_list[r].unitsCancelled, t.product_list[s].unitsReturned += e.product_list[r].unitsReturned, t.product_list[s].revenueValue = (parseFloat(t.product_list[s].revenueValue) + parseFloat(e.product_list[r].revenueValue)).toFixed(2), t.product_list[s].royaltyValue = (parseFloat(t.product_list[s].royaltyValue) + parseFloat(e.product_list[r].royaltyValue)).toFixed(2), Object.keys(e.product_list[r].variation_totals).forEach((function(a) {
                    for (o = 0; o < e.product_list[r].variation_totals[a].length; ++o) {
                        for (l = !1, n = 0; n < t.product_list[s].variation_totals[a].length; ++n) e.product_list[r].variation_totals[a][o].variation == t.product_list[s].variation_totals[a][n].variation && (t.product_list[s].variation_totals[a][n].total += e.product_list[r].variation_totals[a][o].total, l = !0, n = t.product_list[s].variation_totals[a].length);
                        l || t.product_list[s].variation_totals[a].push(e.product_list[r].variation_totals[a][o])
                    }
                })), i = !0, s = t.product_list.length);
                i || t.product_list.push(e.product_list[r])
            }
            Object.keys(e.variation_totals).forEach((function(a) {
                for (o = 0; o < e.variation_totals[a].length; ++o) {
                    for (l = !1, n = 0; n < t.variation_totals[a].length; ++n) e.variation_totals[a][o].variation == t.variation_totals[a][n].variation && (t.variation_totals[a][n].total += e.variation_totals[a][o].total, l = !0, n = t.variation_totals[a].length);
                    l || t.variation_totals[a].push(e.variation_totals[a][o])
                }
            }))
        } else t = jQuery.extend(!0, {}, e);
    "function" == typeof a && a(t)
}

function mn_researchProducts(t, e) {
    var a = {},
        r = {};
    r.page = t.pageNum ? t.pageNum : 1, r.limit = 100, r.mp = t.marketplace ? t.marketplace : "COM", r.type = t.product ? t.product : "SHIRT", r.text = t.search_text.trim() ? t.search_text.trim() : null, "asin" == t.search_in ? (r.mode = "ASIN", r.asin = t.search_text.trim() ? t.search_text.trim() : null) : "title" == t.search_in ? r.mode = "TITLE" : r.mode = t.search_type ? t.search_type : "DEFAULT", r.orderBy = t.sort_by ? t.sort_by : "bsr", r.orderDirection = t.sort_direction ? t.sort_direction : "DESC", r.deleted = !!t.deleted_products && "yes" == t.deleted_products, r.deletedOnly = !1, "UK" == t.marketplace || (r.startBsr = t.bsr_range[0] && t.bsr_range[0] > 0 ? t.bsr_range[0] : 1, r.endBsr = t.bsr_range[1] ? t.bsr_range[1] : null), r.startDate = null, r.endDate = null, r.showOfficial = !!t.official_brands && "yes" == t.official_brands, "pro+" != G_PRO_PLAN && (r.limit = 6, r.mp = "COM", r.type = "SHIRT", r.mode = "TITLE", r.orderBy = "firstDate", r.showOfficial = !0), r = btoa(JSON.stringify(r));
    var s = new XMLHttpRequest;

    function o() {
        "function" == typeof e && e(a)
    }
    s.open("POST", "https://api.prettymerch.com/research/", !0), s.setRequestHeader("PrettyMerch", "true"), s.setRequestHeader("Accept", "application/json, text/plain, */*"), s.onreadystatechange = function() {
        if (4 == s.readyState)
            if (-1 === xml_success_responsees.indexOf(s.status)) o();
            else {
                var e = "";
                try {
                    e = JSON.parse(s.responseText)
                } catch (t) {}
                "true" == e?.success && ((a = JSON.parse(e.data)).searchId = t.searchId, a.keywordSearch = !!t.search_text.trim() && t.search_text.trim(), a.endOfResults = a.items.length < 100, a.items = a.items.map((function(t) {
                    return t.is_obrand = !1, t.brand && G_OFFICIAL_BRANDS.some((e => t.brand.toLowerCase().includes(e.toLowerCase()))) && (t.is_obrand = !0), t
                })), "no" == t.official_brands && (a.items = a.items.filter((function(t) {
                    return !t.is_obrand
                })))), o()
            }
    }, s.send(r)
}

function trademarkSearch(t, e) {
    "pro+" != G_PRO_PLAN && (t.search_query = "adidas", t.marketplace = "ALL", t.nice = "ALL", t.status = "all"), t.search_query = t.search_query.replace(/\s+/g, " ").trim();
    var a = {};
    a.kw = t.search_query ? t.search_query : "", a.mp = t.marketplace ? t.marketplace.toString() : "ALL", a.nc = t.nice ? t.nice.toString() : "ALL", a = btoa(JSON.stringify(a));
    var r = new Headers;
    r.append("PrettyMerch", "true"), r.append("Accept", "*/*"), r.append("Content-Type", "application/json"), fetch("https://api.prettymerch.com/trademark/", {
        method: "POST",
        headers: r,
        body: a,
        redirect: "follow"
    }).then((function(t) {
        return t.json()
    })).then((a => {
        switch (a = JSON.parse(a.data), "all" != t.status && (a.results.all = a.results?.all?.filter((function(e) {
                return e.trademarkstatus.toLowerCase() == t.status
            }))), t.search_type) {
            case "PHRASE":
                a.results.all = a.results?.all?.filter((function(e) {
                    var a = e.tmname?.trim().toLowerCase();
                    return t.match_whole_words ? new RegExp("\\b" + t.search_query + "\\b").test(a) : a.includes(t.search_query)
                }));
                break;
            case "DEFAULT":
                var r = t.search_query.split(" ");
                a.results.all = a.results?.all?.filter((function(e) {
                    var a = !0,
                        s = e.tmname?.trim().toLowerCase();
                    return t.match_whole_words ? (r.forEach((function(t) {
                        new RegExp("\\b" + t + "\\b").test(s) || (a = !1)
                    })), a) : (r.forEach((function(t) {
                        s.includes(t) || (a = !1)
                    })), a)
                }));
                break;
            case "BROAD":
                r = t.search_query.split(" ");
                a.results.all = a.results?.all?.filter((function(e) {
                    var a = !1,
                        s = e.tmname?.trim().toLowerCase();
                    return t.match_whole_words ? (r.forEach((function(t) {
                        new RegExp("\\b" + t + "\\b").test(s) && (a = !0)
                    })), a) : (r.forEach((function(t) {
                        s.includes(t) && (a = !0)
                    })), a)
                }));
                break
        }
        var s;
        a.results.all.length > 500 && (a.results.all = a.results.all.slice(0, 500)), s = a, "function" == typeof e && e(s)
    })).catch((t => {}))
}

function findOpenTabs(t) {
    chrome.tabs.query({
        url: "https://merch.amazon.com/dashboard*"
    }, (function(e) {
        for (var a = [], r = 0; r < e.length; ++r) {
            -1 == e[r].url.indexOf("oldDash") && a.push(e[r])
        }
        "function" == typeof t && t(a)
    }))
}

function updateTabs(t) {
    findOpenTabs((function(e) {
        for (var a = 0; a < e.length; ++a) chrome.tabs.sendMessage(e[a].id, t)
    }))
}

function setBrowserIcons(t) {
    if ("active" == t) {
        chrome.browserAction.setTitle({
            title: "PrettyMerch"
        });
        var e = {
            16: chrome.extension.getURL("/assets/icons/icon16.png"),
            24: chrome.extension.getURL("/assets/icons/icon24.png"),
            32: chrome.extension.getURL("/assets/icons/icon32.png")
        };
        chrome.browserAction.setIcon({
            path: e
        }), chrome.browserAction.setBadgeBackgroundColor({
            color: "#1a63a4"
        }), loggedOutNotification && (chrome.notifications.clear(loggedOutNotification), loggedOutNotification = !1)
    } else {
        chrome.browserAction.setTitle({
            title: "PrettyMerch\nYou are logged out"
        });
        e = {
            16: chrome.extension.getURL("/assets/icons/icon16-bw.png"),
            24: chrome.extension.getURL("/assets/icons/icon24-bw.png"),
            32: chrome.extension.getURL("/assets/icons/icon32-bw.png")
        };
        chrome.browserAction.setIcon({
            path: e
        }), chrome.browserAction.setBadgeBackgroundColor({
            color: "#e3a002"
        })
    }
}

function checkAlarms() {
    chrome.alarms.get("fetchNewSales", (function(t) {
        if (t) {
            var e = moment().valueOf();
            t.scheduledTime <= e && resetAlarms((function(t) {
                fetchNewSales()
            }))
        } else resetAlarms((function(t) {
            fetchNewSales()
        }))
    }))
}

function resetAlarms(t) {
    chrome.alarms.clearAll((function(e) {
        chrome.alarms.create("fetchNewSales", alarmOpts), chrome.alarms.create("updateProductList", {
            delayInMinutes: 3,
            periodInMinutes: 3
        }), chrome.alarms.create("updatePublishedItems", {
            delayInMinutes: 2,
            periodInMinutes: 2
        }), chrome.alarms.create("doMiscTasks", {
            delayInMinutes: 6,
            periodInMinutes: 6
        }), "function" == typeof t && t()
    }))
}

function onAlarm(t) {
    t && ("fetchNewSales" == t.name ? fetchNewSales() : "updateProductList" == t.name ? updateProductList() : "updatePublishedItems" == t.name ? updatePublishedItems() : "doMiscTasks" == t.name ? doMiscTasks() : "doCheckLoginFallback" == t.name ? doCheckLoginFallback() : "retryCheckLogin" == t.name && retryCheckLogin())
}

function updateProductList() {
    findOpenTabs((function(t) {
        t.length > 0 && getProductsList(!1, !1, !0, (function() {
            updateProductMetaData()
        }))
    }))
}

function updatePublishedItems() {
    findOpenTabs((function(t) {
        t.length > 0 && getPublishedItemsSummary()
    }))
}

function fetchNewSales() {
    waitForinitMain((function() {
        getTodaysSales(0, (function(t) {
            t > 0 && findOpenTabs((function(t) {
                t.length > 0 && getDashboardSales("new-sale")
            }))
        })), findOpenTabs((function(t) {
            t.length > 0 && getProcessingItems()
        }))
    }))
}

function initPrettyDash(t) {
    resetAlarms((function(t) {
        getPublishedItemsSummary(), getProcessingItems(), getTodaysSales(), getDashboardSales("initial"), getAllTimeSalesSummary(!0, 750), force_stop_updating_product_meta_data((async function() {
            G_FORCE_STOP_UPDATING_PRODUCT_META_DATA = !1, getProductsList(G_PRODUCT_LIST_DEFAULT_PROGRESS_CONTAINER, 1500, !0, (function() {
                updateProductMetaData(!1, 2e3)
            }))
        })), doMiscTasks(5e3)
    }))
}

function doTestStuff() {}

function initCommon(t) {
    loggedIn = !0, G_AUTOLOGIN_TAB = !1, G_ATTEMPT_AUTO_RE_LOGIN = !0, G_COUNT_LOGIN_ATTEMPTS = 0, G_ARL_LOGGED_OUT_MSG = "", getDesignerId((function(e) {
        initDB((async function() {
            await DB.transaction("rw", DB.app_data, (async function() {
                (G_PRODUCT_COUNT = await DB.app_data.get("product_count")) || updateProductCount("reset", {}, {})
            })).then((function() {})).catch((function(t) {}));
            var e = logged_in_user + "_selectedMarketplace";
            chrome.storage.local.get([e], (function(a) {
                void 0 !== a[e] && (selected_marketplace = marketplaces[a[e]]), checkLicence(!1, (function() {
                    "function" == typeof t && t()
                }))
            }))
        }))
    }))
}

function createEditProductTab(t, e) {
    waitForinitMain((async function() {
        var a = [],
            r = 0,
            s = [],
            o = 0;

        function n(e, r, o) {
            var n = r.identifier,
                i = r.product_type;
            setTimeout((function() {
                a[e] = "https://merch.amazon.com/designs/" + o.designId + "/edit?pm_prod=" + i + "&pm_mrkt=" + o.pm_data.marketplace_extension;
                var r = 1 == e;
                chrome.tabs.create({
                    url: a[e],
                    active: r
                }, (function() {
                    chrome.tabs.sendMessage(t, {
                        edit_tab_opened: !0,
                        product_identifier: n
                    })
                }))
            }), s[e])
        }
        await DB.transaction("r", DB.products, (function() {
            e.forEach((function(e, a, i) {
                !async function(a) {
                    o = Math.floor(401 * Math.random() + 550), s[a] = 1 == a ? 0 : s[a - 1] + o;
                    var r, i, l, c, _, d, u = await DB.products.where("listingId").equals(e.identifier).or("asin").equals(e.identifier).first();
                    u ? n(a, e, u) : (r = a, l = (i = e).identifier, c = i.keywords, _ = i.marketplace, d = !1, findProductsByKeyword(c, _, (function(e) {
                        for (var a = 0; a < e.length; ++a)
                            if (l === e[a].listingId || l === e[a].asin) {
                                var s = e[a];
                                n(r, i, s), a = e.length, d = !0
                            } d || chrome.tabs.sendMessage(t, {
                            edit_product_not_found: !0,
                            product_identifier: l,
                            message: "Could not open<br/>the Edit page"
                        })
                    })))
                }(r += 1)
            }))
        })).then((function() {})).catch((function() {}))
    }))
}

function deleteProductsFromAmazon(t, e, a) {
    a && updateTabs({
        toggleProgressBar: !0,
        container: a,
        action: "show",
        title: "Deleting products..."
    });
    waitForinitMain((function() {
        var r = [];

        function s(e) {
            if (e < r.length) {
                var o = new XMLHttpRequest,
                    n = '{ "id": "' + r[e].designId + '",  "productsToOperateOn": { \t"' + r[e].productType + '": {"' + r[e].marketplace + '": "' + r[e].listingId + '"}  }}';
                o.open("POST", "https://merch.amazon.com/api/productconfiguration/delete", !0), o.setRequestHeader("PrettyMerch", "true"), o.setRequestHeader("Accept", "application/json, text/plain, */*"), o.setRequestHeader("Content-Type", "application/json"), o.onreadystatechange = async function() {
                    if (4 == o.readyState) {
                        if (-1 === xml_success_responsees.indexOf(o.status)) return checkLogIn(), !1;
                        if (-1 != o.responseText.indexOf("AuthenticationPortal")) checkLogIn();
                        else {
                            if (200 == o.status) {
                                if (a) updateTabs({
                                    updateProgressBar: !0,
                                    container: a,
                                    title: "Deleted " + (e + 1) + " of " + r.length + " products",
                                    percentComplete: (e + 1) / r.length * 100
                                });
                                chrome.tabs.sendMessage(t, {
                                    update_deleted_product: !0,
                                    product_identifier: r[e].listingId
                                }), bulkDeleteProducts([r[e].listingId])
                            }
                            s(e + 1)
                        }
                    }
                }, o.send(n)
            } else {
                if (a) updateTabs({
                    toggleProgressBar: !0,
                    container: a,
                    action: "hide",
                    title: "Done..."
                });
                setTimeout((function() {
                    chrome.tabs.sendMessage(t, {
                        update_deleted_product: !0,
                        product_identifier: "finished"
                    })
                }), 350)
            }
        }
        DB.transaction("r", DB.products, (function() {
            e.forEach((async function(t, e, a) {
                var s = await DB.products.where("listingId").equals(t.identifier).or("asin").equals(t.identifier).first();
                s && r.push(s)
            }))
        })).then((function() {
            s(0)
        })).catch((function() {}))
    }))
}

function findProductsByKeyword(t, e, a) {
    checkDesignerId((function(r) {
        if (loggedIn) {
            var s = 0,
                o = [];

            function n() {
                "function" == typeof a && a(o)
            }
            t ? async function t(e, a, r) {
                var i = "https://merch.amazon.com/api/ng-amazon/coral/com.amazon.merch.search.MerchSearchService/FindListings",
                    l = '{ "accountId": "' + G_DESIGNER_ID.accountId + '",  "pageSize": 500,  "pageToken": ' + JSON.stringify(e) + ',  "productDetails": "' + a + '",  "status": ["PUBLISHED"],  "marketplaces": ["' + marketplaces[r].country_code_official.toUpperCase() + '"],  "__type": "com.amazon.merch.search#FindListingsRequest" }';
                let c = null,
                    _ = {
                        url: i,
                        payload: l,
                        fetchType: "POST",
                        progressContainer: null
                    };
                if (await fetchData(_).then((function(t) {
                        try {
                            c = structuredClone(t)
                        } catch (t) {}
                    })).catch((function(t) {})), c?.results) {
                    s += c.results.length;
                    for (var d = 0; d < c.results.length; d++) {
                        var u = c.results[d];
                        o.push(jQuery.extend(!0, {}, u))
                    }
                    s >= c.hitCount || s >= 2e3 ? n() : t(c.pageToken, a, r)
                } else n()
            }([], t, e): n()
        }
    }))
}

function doAutoReLogin(t) {
    chrome.storage.local.get("arl_data", (function(e) {
        void 0 !== e.arl_data && "" != e.arl_data && (G_AUTOLOGIN_TAB = e.arl_data.arl_tab_id), t == G_AUTOLOGIN_TAB && (G_COUNT_LOGIN_ATTEMPTS > 0 ? (chrome.tabs.onUpdated.removeListener(autoReLoginListener), chrome.tabs.remove(G_AUTOLOGIN_TAB, (function() {
            chrome.storage.local.remove("arl_data", (function() {}))
        })), G_AUTOLOGIN_TAB = !1, G_ATTEMPT_AUTO_RE_LOGIN = !1, checkLogIn()) : chrome.tabs.sendMessage(G_AUTOLOGIN_TAB, {
            attempt_auto_login: "true",
            email: OPT_AUTO_RE_LOGIN_EMAIL,
            password: OPT_AUTO_RE_LOGIN_PASSWORD
        }))
    }))
}

function autoReLoginListener(t, e, a) {
    chrome.storage.local.get("arl_data", (function(t) {
        if (void 0 !== t.arl_data && "" != t.arl_data && (G_AUTOLOGIN_TAB = t.arl_data.arl_tab_id), a.id == G_AUTOLOGIN_TAB) {
            var r = "";
            try {
                r = new URL(a.url)
            } catch (t) {
                r = ""
            }
            "loading" == e.status && -1 == a.url.indexOf("merch.amazon.com") && -1 != a.url.indexOf("signin") && (chrome.tabs.onUpdated.removeListener(autoReLoginListener), chrome.tabs.remove(G_AUTOLOGIN_TAB, (function() {
                chrome.storage.local.remove("arl_data", (function() {}))
            })), G_AUTOLOGIN_TAB = !1, G_ATTEMPT_AUTO_RE_LOGIN = !1, G_ARL_LOGGED_OUT_MSG = "Auto Re-Login couldn't log you back in. Please make sure that the Password you entered in the Auto Re-Login Options is correct", checkLogIn()), "" != r && "loading" == e.status && -1 != r.host.indexOf("merch.amazon.com") && -1 != r.href.indexOf("autoReLogin") && (G_ATTEMPT_AUTO_RE_LOGIN = !1, chrome.tabs.onUpdated.removeListener(autoReLoginListener), chrome.tabs.remove(G_AUTOLOGIN_TAB, (function() {
                chrome.storage.local.remove("arl_data", (function() {}))
            })), checkLogIn((function(t) {
                t && (G_AUTOLOGIN_TAB = !1, G_ATTEMPT_AUTO_RE_LOGIN = !0, G_COUNT_LOGIN_ATTEMPTS = 0, resetAlarms((function(t) {
                    fetchNewSales()
                })))
            })))
        }
    }))
}
initMain((function() {})), chrome.extension.onMessage.addListener((function(t, e, a) {
    if ("prettyDash" == t.initApp && (setBrowserIcons("active"), waitForinitMain((function() {
            initCommon((function() {
                initPrettyDash(e.tab.id)
            }))
        }))), "otherPage" == t.initApp && (setBrowserIcons("active"), waitForinitMain((function() {
            initCommon((function() {
                checkAlarms()
            }))
        }))), t.loaded_auto_re_login) return a({
        msg: "Ok"
    }), doAutoReLogin(e.tab.id), !0;
    if (t.show_in_bg_log, t.refresh_all_time_no_cache && getAllTimeSalesSummary(!1, 0), t.get_all_time_sales) {
        var r = beginning_of_time.valueOf(),
            s = moment().startOf("day").valueOf(),
            o = selected_marketplace.country_code;
        return getSalesCSV(r, s, [o], t.progress_container, "", 0, !0, !1, !1, (function(t) {
            var e = {
                market_code: o,
                market_totals: t[o].market_totals,
                chart_data: t[o].chart_data.monthly
            };
            a(e)
        })), !0
    }
    if (t.get_sales_summary) return "all-time" == t.period ? getAllTimeSalesStats(!0, t.target_container, 0, (function(t) {
        a(t)
    })) : getSalesSummary(t.period, t.startDate, t.endDate, t.target_container, 0, !0, (function(t) {
        a(t)
    })), !0;
    if (t.fetch_analytics) return getSalesCSV(t.dates.start_date, t.dates.end_date, t.selected_marketplaces, ".analytics-results-containter", !1, !1, !0, !1, !1, (function(t) {
        a({
            salesSummary: t
        })
    })), !0;
    if (t.researchProducts) return mn_researchProducts(t.searchVals, (function(t) {
        a({
            searchResults: t
        })
    })), !0;
    if (t.trademarkSearch) return trademarkSearch(t.searchVals, (function(t) {
        a({
            searchResults: t
        })
    })), !0;
    if (t.update_product_list && getProductsList(t.progress_container, 0, t.useCache), t.update_product_meta_data && updateProductMetaData(!0), t.manual_check_for_sales && fetchNewSales(), t.trigger_do_misc_tasks && doMiscTasks(), t.manual_check_for_tier_up && getPublishedItemsSummary(), t.trigger_auto_login && triggerAutoReLogin(), t.trigger_check_login && checkLogIn(), t.user_logged_in && handleLogIn(t.s_id), t.get_logged_in_user_and_marketplace) return waitForinitMain((function() {
        var t = 0,
            e = {},
            r = {};
        DB.transaction("r", DB.app_data, (async function() {
            e = await DB.app_data.get("last_product_list_sales_merge"), r = await DB.app_data.get("last_product_list_full_download")
        })).then((function() {
            e && e.date && (t = e.date), r = !!r?.date && r.date, a({
                logged_in_user: logged_in_user,
                selected_marketplace: selected_marketplace,
                last_db_merge_date: t,
                last_products_full_sync: r
            })
        })).catch((function(t) {}))
    })), !0;
    if (t.getAllMarketplacesInfo) return a({
        allMarketplaces: marketplaces
    }), !0;
    if (t.user_logged_out && waitForinitMain((function() {
            showLogoutNotification = !1, G_ATTEMPT_AUTO_RE_LOGIN = !1, setTimeout((function() {
                checkLogIn()
            }), 2e3)
        })), t.fetchProductListingDetails) return fetchProductListingDetails(t.product.asin, t.product.product_type, t.product.marketplace_extension, 0, (function(t) {
        a(t)
    })), !0;
    if (t.validateLicenceInBg) return validateLicence(t.data, (function(t) {
        a(t)
    })), !0;
    if (t.saveOptions && (saveOptions(t.options, (function(t) {})), a({
            test: !0
        })), t.open_addNew_tabs)
        for (var n = "single" == t.uploader_type ? "https://merch.amazon.com/merch-tshirt/title-setup/new/upload_art" : "https://merch.amazon.com/designs/new", i = 0; i < t.num_tabs; ++i) {
            var l = 0 == i;
            setTimeout((function() {
                chrome.tabs.create({
                    url: n,
                    active: l
                })
            }), 2e3 * i)
        }
    if (t.createEditProductTab) {
        var c = t.merchandise_list;
        createEditProductTab(e.tab.id, c)
    }
    if (t.deleteProductsFromAmazon) {
        c = t.merchandise_list;
        deleteProductsFromAmazon(e.tab.id, t.merchandise_list, t.progress_container)
    }
    return t.filterManageProductsTable ? (filterProducts(t.filters, (function(t) {
        a(t)
    })), !0) : t.fetchProductImageByAsin ? (fetchProductImageByAsin(t.asin, t.marketplace, t.imgSize, (function(t) {
        a(t)
    })), !0) : t.fetchProductImageByListingId ? (waitForinitMain((function() {
        fetchProductImageByListingId(t.productImagesArray, (function(t) {
            a(t)
        }))
    })), !0) : void(t.update_extension_now && chrome.runtime.reload())
})), chrome.alarms.onAlarm.addListener(onAlarm), chrome.notifications.onClicked.addListener((function(t) {
    welcomeNotification && (chrome.tabs.create({
        url: "https://merch.amazon.com/dashboard"
    }), chrome.notifications.clear(welcomeNotification), welcomeNotification = !1), loggedOutNotification && (chrome.windows.getAll((function(t) {
        t.length > 0 ? chrome.tabs.create({
            url: "https://merch.amazon.com/dashboard"
        }) : chrome.windows.create({
            url: "https://merch.amazon.com/dashboard"
        })
    })), chrome.notifications.clear(loggedOutNotification), loggedOutNotification = !1), newSaleNotification && (chrome.windows.getAll((function(t) {
        t.length > 0 ? chrome.tabs.create({
            url: "https://merch.amazon.com/dashboard"
        }) : chrome.windows.create({
            url: "https://merch.amazon.com/dashboard"
        })
    })), chrome.notifications.clear(newSaleNotification), newSaleNotification = !1)
})), chrome.notifications.onButtonClicked.addListener((function(t, e) {
    t === loggedOutNotification && (0 === e ? (chrome.windows.getAll((function(t) {
        t.length > 0 ? chrome.tabs.create({
            url: "https://merch.amazon.com/dashboard"
        }) : chrome.windows.create({
            url: "https://merch.amazon.com/dashboard"
        })
    })), chrome.notifications.clear(loggedOutNotification), loggedOutNotification = !1) : 1 === e && (chrome.notifications.clear(loggedOutNotification), loggedOutNotification = !1))
})), chrome.notifications.onClosed.addListener((function(t, e) {
    welcomeNotification && (welcomeNotification = !1), loggedOutNotification && (loggedOutNotification = !1), newSaleNotification && (newSaleNotification = !1)
})), chrome.runtime.onInstalled.addListener((function(t) {
    waitForinitMain((function() {
        "install" == t.reason && (G_ATTEMPT_AUTO_RE_LOGIN = !1, forceLogout((function() {
            var t = {
                type: "image",
                isClickable: !0,
                requireInteraction: !0,
                title: "You just installed PrettyMerch",
                message: "Click here to go to your new and improved Merch Dashboard",
                iconUrl: chrome.extension.getURL("/assets/img/notificationLogo.png"),
                imageUrl: chrome.extension.getURL("/assets/img/notification-welcome-min.png")
            };
            chrome.notifications.create(t, (function(t) {
                welcomeNotification = t, showLogoutNotification = !1, handleLogOut()
            }));
            chrome.storage.sync.set({
                welcomeMessage: {
                    show_welcome_message: !0,
                    title: "Hello. Welcome to PrettyMerch!",
                    message: "<p>Congratulations, you just gave your Merch dashboard a major upgrade!</p><p>Now you can get a quick view of your sales and a summary of everything that is important in a beautiful way. You don't have to refresh this page; It updates as you sell and notifies you of new sales immediately.</p>"
                }
            }, (function() {}))
        }))), "update" == t.reason && (G_ATTEMPT_AUTO_RE_LOGIN = !0, resetAlarms((function(t) {
            var e = chrome.runtime.getManifest(),
                a = {
                    show_update: !1,
                    version: e.version,
                    title: "PrettyMerch has been updated to v" + e.version,
                    message: "<b>You're now rocking our newest and best version ever</b><br/><br/>Here's what has changed:",
                    free_list: ['<p style="margin-bottom: 3px;"><b>Bug Fixes and Improvements</b></p><p style="margin-bottom: 3px;">➡ Fixed Timezone Difference between PrettyMerch and the regular Merch dashboard.</p><p style="margin-bottom: 3px;">➡ Fixed Sales Discrepancy between Analytics and Products page. Total sales will now appear correctly throughout PrettyMerch.</p><p style="margin-bottom: 3px;">➡ PrettyMerch now handles failed connections better, and will continue updating Sales and Products from where it left off.</p><p style="margin-bottom: 3px;">➡ Fixed errors when validating licences for Pro accounts.</p><p style="margin-bottom: 3px;">➡ Improved syncing of Reviews, BSRs and listing data.</p><p style="margin-bottom: 3px;">➡ We made several fixes to speed up the extension and reduce memory usage.</p>'],
                    pro_list: []
                };
            DB.transaction("rw", DB.app_data, (async function() {
                if (0) {
                    await DB.app_data.put({
                        title: "force_refresh_products",
                        value: "true"
                    })
                }
                if (0) {
                    await DB.app_data.put({
                        title: "force_refresh_sales",
                        value: "true"
                    })
                }
            })).then((function() {})).catch((function(t) {})), chrome.storage.sync.set({
                updateMessage: a
            }, (function() {}))
        })));
        if (1) {
            chrome.extension.getURL("/assets/img/offers/2022-05-fb-giveaway-ext.png"), chrome.extension.getURL("/assets/img/offers/2021-11-black-friday-sale-ext-2.png"), chrome.extension.getURL("/assets/img/offers/2021-11-black-friday-sale-ext-3.png"), chrome.extension.getURL("/assets/img/offers/2021-11-black-friday-sale-ext-4.png"), chrome.extension.getURL("/assets/img/offers/2021-11-black-friday-sale-ext-5.png"), chrome.extension.getURL("/assets/img/offers/2020-11-black-friday-sale-6.png");
            var e = {
                campaign: "midseason-v1",
                ads: {
                    ad_20230515: {
                        html: '<a href="https://bit.ly/pretty-offer" target="_blank"><img src="' + chrome.extension.getURL("/assets/img/offers/midseason_banner.png") + '" style="width: 1000px; height: auto; border-radius: 8px; margin: 0"></a>',
                        start_date: "2023-05-15",
                        end_date: "2023-05-19"
                    }
                }
            };
            chrome.storage.sync.get("specialOffers", (function(t) {
                void 0 !== t.specialOffers && "" != t.specialOffers ? t.specialOffers.campaign == e.campaign || chrome.storage.sync.remove("specialOffers", (function() {
                    chrome.storage.sync.set({
                        specialOffers: e
                    }, (function() {}))
                })) : chrome.storage.sync.set({
                    specialOffers: e
                }, (function() {}))
            }))
        } else chrome.storage.sync.remove("specialOffers")
    }))
})), chrome.runtime.onStartup.addListener((function(t) {
    waitForinitMain((function() {
        showLogoutNotification = !1, G_ATTEMPT_AUTO_RE_LOGIN = !1, resetAlarms((function(t) {
            fetchNewSales()
        }))
    }))
})), chrome.browserAction.onClicked.addListener((function(t) {
    chrome.tabs.query({
        url: "https://merch.amazon.com/dashboard*"
    }, (function(t) {
        t.length ? chrome.tabs.update(t[0].id, {
            active: !0
        }, (function(t) {})) : chrome.tabs.create({
            url: "https://merch.amazon.com/dashboard"
        })
    }))
})), chrome.webRequest.onBeforeSendHeaders.addListener((function(t) {
    var e = t.requestHeaders,
        a = !1,
        r = 0;
    return e.forEach((function(t, s) {
        "prettymerch" == t.name.toLowerCase() && (a = !0, r = s, e.forEach((function(t, e) {
            "user-agent" == t.name.toLowerCase() && (t.value += " PrettyMerch/" + G_EXTENSION_VERSION)
        })))
    })), a && e.splice(r, 1), {
        requestHeaders: e
    }
}), {
    urls: ["https://merch.amazon.com/*", "https://api.prettymerch.com/*"],
    types: ["xmlhttprequest"]
}, ["blocking", "requestHeaders"]);