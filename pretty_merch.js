moment.tz.setDefault("America/Los_Angeles");
var debugMode = !1,
    chartContainers = {},
    logged_in_user = !1,
    selected_marketplace = !1,
    G_IS_PRO = !1,
    G_PRO_PLAN = "free",
    G_LICENCE = !1,
    G_LICENCE_CANCELLED_AT = !1,
    G_LICENCE_FAILED_AT = !1,
    G_LICENCE_MSG = "",
    G_TAX_RATE = 0,
    G_MARKETPLACE_ORDER_ID = ["ATVPDKIKX0DER", "A1F83G8C2ARO7P", "A1PA6795UKMFR9", "A13V1IB3VIYZZH", "APJ6JRA9NG5V4", "A1RKKUPIHCS9HS", "A1VC38T7YXB528"],
    G_MARKETPLACE_ORDER_CODE = ["usa", "uk", "ger", "fr", "it", "es", "jp"],
    G_PRODUCT_LIST = {},
    G_PRODUCT_LIST_IS_READY = !1,
    G_EXCLUDED_BULLETS = ["T-Shirts sind tailliert geschnitten.", "Machine wash cold with like colors, dry low heat", "Solid colors: 80% Cotton, 20% Polyester; Heather Grey: 78% Cotton, 22% Poly; Dark Heather: 50% Cotton, 50% Polyester", "8.5 oz, Classic fit, Twill-taped neck", "8.5 oz, classic cut", "8.5 oz, classic cut, double stitched hem", "Slim Fit. Consider ordering a larger size for a looser fit.", "Unifarben: 100% Baumwolle; Grau meliert: 90% Baumwolle, 10% Polyester; Alle anderen melierten Farben: ", "Pflegehinweis: Maschinenwäsche kalt mit ähnlichen Farben, trocknergeeignet bei niedrigen Temperaturen", "Klassisch geschnitten, doppelt genähter Saum.", "Solid colors: 100% Cotton; Heather Grey: 90% Cotton, 10% Polyester; All Other Heathers: 50% Cotton, 50% Polyester", "Imported", "Classic Fit", "Short Sleeve", "Fastening: Pull On", "Machine Wash", "Outer Material: PH", "Plain colours: 100% cotton; mottled grey: 90% cotton, 10% polyester; all other mottled colours: 50% cotton, 50% polyester.", "Classic cut, double-stitched hem.", "Unifarben: 100% Baumwolle; Grau meliert: 90% Baumwolle, 10% Polyester; Alle anderen melierten Farben: 50% Baumwolle, 50% Polyester", "Material Composition: Solid colors: 80% Cotton, 20% Polyester; Heather Grey: 78% Cotton, 22% Poly; Dark Heather: 50% Cotton, 50% Polyester", "Lightweight, Classic fit, Double-needle sleeve and bottom hem", "Pop, tilt, wrap, prop, collapse, grip, Repeat", "Secure grips for texting, calling, photos, and selfies", "Note: will not stick to some silicone", "PopGrip Aluminum features a swappable aluminum PopTop", "Offers a secure grip so you can text with one hand, snap better photos, and watch videos hands-free", "Use with a PopSockets PopMount 2 and go hands free", "PopGrips are compatible with PopWallet+, Otter + Pop cases, PopPower Home Wireless Charger, and PopMount 2", "Sticks best to smooth hard plastic cases. Sticks to iPhone 11; will not stick to iPhone 11 Pro or iPhone 11Pro Max without a suitable case.", "PopGrip with swappable top; switch out your PopTop for another design or remove it completely for wireless charging capabilities. (Not compatible with Apple MagSafe wireless charger or MagSafe wallet.)", "Expandable stand to watch videos, take group photos, FaceTime, and Skype handsfree.", "Advanced adhesive allows you to remove and reposition on most devices and cases.", "Note: Will not stick to some silicone, waterproof, or highly textured cases. Works best with smooth, hard plastic cases. Will adhere to iPhone 11, but not to the iPhone 11 Pro nor the iPhone 11 ProMax without a suitable case.", "PopGrip with swappable top", "Make sure this fits\nby entering your model number", "PopGrip with replaceable lid, swap your PopTop for a different design", "Extendable holder for watching videos", "Advanced adhesive allows for easy removal", "Collapsible handle provides secure grip for easy typing, making calls and taking photos", "Retractable holder for watching videos, taking pictures of groups and for facetime or Skype video calls", "Advanced adhesive allows you to easily remove and reapply", "Pull On closure", "Collar Style: Band Collar", "Closure: Pull On", "Half Sleeve", "Coupe classique", "Manche courte", "Manche mi longue"];

function toTitleCase(e) {
    return e.replace(/([^\W_]+[^\s-]*) */g, (function(e) {
        return e.charAt(0).toUpperCase() + e.substr(1).toLowerCase()
    }))
}

function isAsin(e) {
    return new RegExp(/(B[\dA-Z]{9}|\d{9}(X|\d))/g).test(e)
}

function findKeywordsFromTitle(e) {
    var t = [],
        a = 0,
        s = "";
    if (e) {
        var i = e.split(" ");
        for (x = 0; x < i.length; ++x) {
            var l = i[x].match(/\w+/g);
            l && 1 == l.length && (t.push(l[0]), ++a), a > 2 && (x = i.length)
        }
        s = t.join("+").toLowerCase()
    }
    return s
}

function showModal(e, t) {
    (t = t || !1) ? $(e).modal(t): $(e).modal()
}

function autoReLogin(e, t) {
    function a() {
        onmessage = function(e) {
            var t = Math.floor(1010 * Math.random() + 1501);
            setTimeout((function() {
                postMessage("go")
            }), t)
        }
    }
    window != self && a();
    var s = new Worker(URL.createObjectURL(new Blob(["(" + a.toString() + ")()"], {
        type: "text/javascript"
    })));
    s.postMessage(0), chrome.extension.sendMessage({
        show_in_bg_log: "true",
        msg: moment().format("HH:mm:ss") + " Creating Timeout"
    }), s.onmessage = function(a) {
        chrome.extension.sendMessage({
            show_in_bg_log: "true",
            msg: moment().format("HH:mm:ss") + " Running Timeout"
        }), document.getElementById("ap_email") ? document.getElementById("ap_email").value = e : document.getElementById("ap-claim") && (document.getElementById("ap-claim").value = e, document.getElementById("ap-credential-autofill-hint").value = e, document.getElementById("ap-credential-autofill-hint").dataset.claim = e), document.getElementById("ap_password").value = t, document.getElementById("signInSubmit").click()
    }, s.onerror = function(e) {
        chrome.extension.sendMessage({
            show_in_bg_log: "true",
            msg: "Worker got en error " + e.data
        })
    }
}

function showImageByAsin(e, t, a, s) {
    chrome.extension.sendMessage({
        fetchProductImageByAsin: !0,
        asin: e,
        marketplace: t,
        imgSize: a
    }, (function(e) {
        getImgUrlFromEncodedBlob(e, (function(e) {
            s.prop("src", e)
        }))
    }))
}

function getImgUrlFromEncodedBlob(e, t) {
    for (var a = atob(e.split(",")[1]), s = e.split(",")[0].split(":")[1].split(";")[0], i = new ArrayBuffer(a.length), l = new Uint8Array(i), r = 0; r < a.length; r++) l[r] = a.charCodeAt(r);
    var o = new Blob([l], {
        type: s
    });
    t(URL.createObjectURL(o))
}

function loadProductRowImg(e) {
    var t = e.data("asin"),
        a = e.data("marketplace");
    t && showImageByAsin(t, a, "vs", e.find(".pm-product-row-img"))
}

function findContainersWithImagesToLoad(e) {
    var t = [];
    e.find(".pm-product-container-with-img").each((function() {
        var e = $(this).closest(".lazy-load-images-container")[0],
            a = !1;
        for (x = 0; x < t.length; ++x) $(t[x])[0] === $(e)[0] && (a = !0, x = t.length);
        a || t.push(e)
    })), t.forEach((function(e) {
        showProductImages($(e))
    }))
}

function showProductImages(e, t) {
    if (t = void 0 !== t ? t : 0, "none" != e.closest(".lazy-load-images-container").css("display"))
        if (G_PRODUCT_LIST_IS_READY) {
            var a = [];
            e.find(".pm-product-container-with-img").each((function() {
                if ($(this).find(".pm-load-product-img").length > 0) {
                    var e = {
                        asin: $(this).data("asin"),
                        listingId: $(this).data("listingId"),
                        identifier: $(this).data("identifier")
                    };
                    e.identifier && a.push(e)
                }
            })), a.length > 0 && fetchProductImagesByListingId(a, (function(t) {
                t.forEach((function(t) {
                    t.location && e.find('.pm-product-container-with-img[data-identifier="' + t.identifier + '"] .pm-load-product-img').each((function() {
                        $(this).prop("src", t.location), $(this).attr("data-content", ' <img class="pm-popover-thumbnail" src=\'' + t.location + "'/> "), $(this).removeClass("pm-load-product-img"), $("#blur_switch").is(":checked") ? $(this).popover("disable") : $(this).popover()
                    }))
                }))
            }))
        } else t < 200 && (e.find(".pm-product-container-with-img .pm-load-product-img").each((function() {
            $(this).attr("data-content", ' <div style="text-align: center"><div style="font-weight: 600; font-size: 14px">Loading</div><div>Images will appear once your products are indexed</div> '), $(this).popover()
        })), setTimeout((function() {
            showProductImages(e, t + 1)
        }), 3e3))
}

function fetchProductImagesByListingId(e, t) {
    chrome.extension.sendMessage({
        fetchProductImageByListingId: !0,
        productImagesArray: e
    }, (function(e) {
        t(e)
    }))
}

function trigger_click_on_target_product() {
    var e = new URL(window.location.href),
        t = e.searchParams.get("pm_prod"),
        a = e.searchParams.get("pm_mrkt"),
        s = "";
    switch (t) {
        case "standard_t-shirt":
            s = "STANDARD_TSHIRT";
            break;
        case "premium_t-shirt":
            s = "PREMIUM_TSHIRT";
            break;
        case "v-neck_t-shirt":
            s = "VNECK";
            break;
        case "tank_top":
            s = "TANK_TOP";
            break;
        case "long_sleeve_t-shirt":
            s = "STANDARD_LONG_SLEEVE";
            break;
        case "raglan":
            s = "RAGLAN";
            break;
        case "sweatshirt":
            s = "STANDARD_SWEATSHIRT";
            break;
        case "pullover_hoodie":
            s = "STANDARD_PULLOVER_HOODIE";
            break;
        case "zip_hoodie":
            s = "ZIP_HOODIE";
            break;
        case "popsockets":
            s = "POP_SOCKET";
            break;
        default:
            s = ""
    }
    if ("" != s) {
        s += "-edit-btn";
        var i = document.getElementsByClassName(s);
        if (i.length > 0) i[0].click(), setTimeout((function() {
            var e = document.getElementsByClassName("product-editor-container")[0].getElementsByClassName("price-container");
            setTimeout((function() {
                for (var t = 0; t < e.length; t++) {
                    if (e.item(t).getElementsByClassName("pl-3")[0].textContent == a) e.item(t).querySelectorAll("[formcontrolname='amount']")[0].select(), t = e.length
                }
            }), 250)
        }), 550);
        else setTimeout(trigger_click_on_target_product, 750)
    }
}

function toggleLoaderDiv(e, t) {
    var a = $(e).find(".loader-container").length > 0;
    "show" == t ? a || ($(e).prepend('<div class="loader-container fade"><div class="pretty-spinner"></div></div>'), setTimeout((function() {
        $(e).find(".loader-container").addClass("show")
    }), 100)) : a && ($(e).find(".loader-container").removeClass("show"), setTimeout((function() {
        $(e).find(".loader-container").remove()
    }), 300))
}

function toggleProgressBar(e, t, a) {
    var s = '<div class="progress-container fade"><div class="progress-title">' + a + '</div><div class="progress" style="max-width: 440px; margin: 0 auto;"><div class="progress-bar" style="width: 0%; height: 15px; background-color:#5facff;"></div></div></div>',
        i = $(e).find(".progress-container").length > 0;
    "show" == t ? i || ($(e).prepend(s), setTimeout((function() {
        $(e).find(".progress-container").addClass("show")
    }), 10)) : i && setTimeout((function() {
        $(e).find(".progress-container").removeClass("show"), setTimeout((function() {
            $(e).find(".progress-container").remove()
        }), 300)
    }), 500)
}

function updateProgressBar(e, t, a) {
    a = a || !1, $(e).find(".progress-container").length > 0 && ("number" == typeof t && $(e).find(".progress-container .progress-bar").css("width", t + "%"), a && $(e).find(".progress-container .progress-title").html(a))
}

function updateDbProgressBar(e) {
    if ($(".db-progress-container").first()) {
        var t = $(".db-progress-container .db_progress_text").first(),
            a = $(".db-progress-container .db_progress_number").first(),
            s = $(".db-progress-container i").first(),
            i = $(".db-progress-container .db-progress-inner").first(),
            l = $(".db-progress-container .db_progress_bar").first();
        "show" == e.action && (t.text("Checking for updates"), s.removeClass().addClass("fa fa-circle-o-notch fa-spin"), l.css("width", "0")), "update" == e.action && (s.removeClass().addClass("fa fa-circle-o-notch fa-spin"), i.css("opacity", "1"), t.removeClass().addClass("db_progress_text float-left").text("Updating - " + e.text), a.removeClass("hidden").text(e.progress.toFixed(2) + "%"), l.css("width", e.progress + "%")), "hide" == e.action && ($(".manage-products-table-actions .update-products-meta-data i").removeClass().addClass("fa fa-list-ul"), t.removeClass().addClass("db_progress_text float-right").text("Database Updated"), a.addClass("hidden"), s.removeClass().addClass("fa fa-check-circle complete"), setTimeout((function() {
            i.css("opacity", "0"), setTimeout((function() {
                l.css("width", "100%")
            }), 250)
        }), 750))
    }
}

function initFloatingHeader(e, t) {
    if ($(e).length > 0) {
        var a = $(e);
        if ("show" == t) a.hasClass("floatThead-table") ? a.trigger("reflow") : (a.off("floatThead").on("floatThead", (function(e, t, a) {
            t ? a.addClass("floated") : a.removeClass("floated")
        })), a.floatThead({
            top: 90,
            responsiveContainer: function(e) {
                return e.closest(".manage-products-table-wrapper")
            }
        }));
        else if ("destroy" == t) a.floatThead("destroy")
    }
}

function removeLoadingFromEditLink(e, t, a) {
    a = a || "", document.querySelectorAll('.edit-product[data-identifier="' + e + '"] .fa-circle-o-notch').forEach((function(e) {
        var s = $(e).closest("tr"),
            i = $(e).closest(".btn");
        t ? (s.addClass("pm-edited-row"), i.attr("title", "Edited").tooltip("_fixTitle"), $(e).removeClass().addClass("fa fa-check").css("color", "#77c547")) : (i.addClass("disabled").attr("title", a).tooltip("_fixTitle"), $(e).removeClass().addClass("fa fa-ban").css("color", "#e82e2e"))
    }))
}

function updateDeletedProduct(e) {
    "finished" == e ? $("#generalMessageModal").modal("hide") : document.querySelectorAll('.manage-products-table-container tr[data-identifier="' + e + '"]').forEach((function(e) {
        $(e).addClass("disabled-row"), $(e).hasClass("pm-selected-row") && $(e).find(".pm-checkbox input").first().click(), $(e).find("td").each((function(e, t) {
            $(t).css("position", "relative").append('<div class="cell-disabler"></div>')
        })), $(e).data("is_deletable", "false"), $(e).find(".status").first().html("Deleted").css("color", "#e82e2e"), $(e).find(".actions").first().html("")
    }))
}

function generateTitleDate(e, t) {
    var a = "";
    e = moment(e).startOf("day").valueOf(), t = moment(t).startOf("day").valueOf(), a || e != t || (a = moment(e).format("MM/DD/YYYY"));
    var s = e,
        i = t;
    if (!a && moment(s).format("MMM") == moment(i).format("MMM")) {
        s = e, i = t;
        var l = moment(s).startOf("month").valueOf(),
            r = moment(s).endOf("month").startOf("day").valueOf();
        moment(s).startOf("day").valueOf() == l && moment(i).startOf("day").valueOf() == r && (a = moment(s).format("MMMM YYYY")), s = e, i = t;
        var o = moment().format("MMM");
        a || moment(s).format("MMM") != o || moment(s).startOf("day").valueOf() != moment().startOf("month").valueOf() || moment(i).startOf("day").valueOf() != moment().startOf("day").valueOf() || (a = moment(s).format("MMMM YYYY"))
    }
    s = e, i = t;
    if (!a && moment(s).format("YYYY") == moment(i).format("YYYY")) {
        s = e, i = t;
        var d = moment(s).startOf("year").valueOf(),
            n = moment(s).endOf("year").startOf("day").valueOf();
        moment(s).startOf("day").valueOf() == d && moment(i).startOf("day").valueOf() == n && (a = moment(s).format("YYYY")), s = e, i = t;
        var c = moment().format("YYYY");
        a || moment(s).format("YYYY") != c || moment(s).startOf("day").valueOf() != moment().startOf("year").valueOf() || moment(i).startOf("day").valueOf() != moment().startOf("day").valueOf() || (a = moment(s).format("YYYY"))
    }
    return s = e, i = t, a || (a = moment(s).format("MM/DD/YY") + " - " + moment(i).format("MM/DD/YY")), a
}

function updatePublishedItemsSummary(e) {
    if (e.toggleLoader && ("show" == e.toggleLoader ? $(".dash-top-stats-row .loading-icon").css("opacity", 1) : "hide" == e.toggleLoader && $(".dash-top-stats-row .loading-icon").css("opacity", 0)), e.hasOwnProperty("dailyUpload") && ($(".daily-limit").find(".progress-bar").css("width", e.dailyUpload.percent + "%"), $(".daily-limit .used").html(e.dailyUpload.count), $(".daily-limit .limit").html(e.dailyUpload.limit), $(".daily-limit .progress-percent").html("(" + parseInt(e.dailyUpload.percent) + "%)"), $(".published-designs").find(".progress-bar").css("width", e.totalDesign.percent + "%"), $(".published-designs .used").html(e.totalDesign.count), $(".published-designs .limit").html(e.totalDesign.limit), $(".published-designs .progress-percent").html("(" + parseFloat(e.totalDesign.percent).toFixed(1) + "%)"), $(".total-limit").find(".progress-bar").css("width", e.totalProduct.percent + "%"), $(".total-limit .used").html(e.totalProduct.count), $(".total-limit .limit").html(e.totalProduct.limit), $(".total-limit .progress-percent").html("(" + parseFloat(e.totalProduct.percent).toFixed(1) + "%)"), $(".header-stats.tier .tier-text .number").html(e.tier_number), $(".dash-top-stats-row .products-with-sales .limit").html(e.totalProduct.count), $(".header-stats.tier .tier-icon").css("background-image", "url(" + e.tier_img + ")"), $(".header-stats.tier .tier-icon").attr("data-html", !0).attr("data-original-title", "Merch Level:<br/><b>" + e.tier_name.toUpperCase() + "</b>").tooltip({
            delay: {
                show: 200,
                hide: 0
            }
        })), e.totalProductWithSales) {
        var t = parseFloat((e.totalProductWithSales / e.totalProduct.count * 100).toFixed(1));
        $(".dash-top-stats-row .products-with-sales .used").html(e.totalProductWithSales), $(".dash-top-stats-row .products-with-sales .progress-percent").html("(" + t + "%)"), $(".dash-top-stats-row .products-with-sales .progress-bar").css("width", t + "%")
    }
    if (e.totalReviews) {
        var a = (e.totalReviewScore / e.productsWithReviews).toFixed(1),
            s = a / 5 * 100;
        $(".dash-top-stats-row .products-with-reviews .review-stars").addClass("has-reviews"), $(".dash-top-stats-row .products-with-reviews .review-stars span").css("width", s + "%"), $(".dash-top-stats-row .products-with-reviews .review-score").html(a), $(".dash-top-stats-row .products-with-reviews .review-total").html(e.totalReviews)
    }
}

function updateProcessingItemsSummary(e) {
    e.total_under_review > 0 ? $(".header-stats.auto-review").addClass("active") : $(".header-stats.auto-review").removeClass("active"), $(".header-stats.auto-review .number").html(e.total_under_review), e.total_processing > 0 ? $(".header-stats.processing").addClass("active") : $(".header-stats.processing").removeClass("active"), $(".header-stats.processing .number").html(e.total_processing), e.total_rejected > 0 ? $(".header-stats.rejected").addClass("active") : $(".header-stats.rejected").removeClass("active"), $(".header-stats.rejected .number").html(e.total_rejected)
}

function deductTax(e) {
    return (e * (1 - G_TAX_RATE / 100)).toFixed(2)
}

function royaltiesTitleText(e, t) {
    t = t || "$";
    var a = "Royalties";
    return G_TAX_RATE > 0 && (a += "\n" + t + deductTax(e) + " after " + G_TAX_RATE + "% tax"), a
}

function royaltiesTaxClass() {
    return G_TAX_RATE > 0 ? "royalties-with-tax" : ""
}

function royaltiesTaxIcon() {
    return G_TAX_RATE > 0 ? '<span class="royalties-tax-icon" style="">*</span>' : ""
}

function formatRoyaltiesElement(e, t, a) {
    a = a || "$", e.attr("title", royaltiesTitleText(t, a)), G_TAX_RATE > 0 && (e.hasClass("royalties-with-tax") || e.addClass(royaltiesTaxClass()), e.find(".royalties-tax-icon").length || e.append(royaltiesTaxIcon()))
}

function updateSalesSummary(e) {
    e.result_container && ($(e.result_container).find(".title .subtitle").html(e.title_date), $(e.result_container).find(".net-sales").html(e[selected_marketplace.country_code].market_totals.net_sales), $(e.result_container).find(".total-sales").html(e[selected_marketplace.country_code].market_totals.total_sold), $(e.result_container).find(".cancelled").html(e[selected_marketplace.country_code].market_totals.total_cancelled), $(e.result_container).find(".returned").html(e[selected_marketplace.country_code].market_totals.total_returned), $(e.result_container).find(".revenue .number").html(e[selected_marketplace.country_code].market_totals.total_revenue), $(e.result_container).find(".royalties .currency-symbol").html(e[selected_marketplace.country_code].marketplace_info.currency_symbol), $(e.result_container).find(".royalties .number").html(parseFloat(e[selected_marketplace.country_code].market_totals.total_royalties).toFixed(2)), formatRoyaltiesElement($(e.result_container).find(".royalties"), e[selected_marketplace.country_code].market_totals.total_royalties, e[selected_marketplace.country_code].marketplace_info.currency_symbol), toggleLoaderDiv(e.result_container, "hide"))
}

function updateSalesFlag(e, t) {
    $(".header-flag." + e + " .sales-number").html(t)
}

function updateAllTimeSalesSummary(e) {
    var t = ".sales-summary.all-time";
    e.net_sales > 99999 && $(t).addClass("summary-style-2-lg"), $(t).find(".net-sales").html(e.net_sales - e.total_returned), $(t).find(".total-sales").html(e.total_sold), $(t).find(".cancelled").html(e.total_cancelled), $(t).find(".returned").html(e.total_returned), $(t).find(".royalties .currency-symbol").html(e.currency_symbol), $(t).find(".royalties .number").html(parseFloat(e.total_royalties).toFixed(2)), formatRoyaltiesElement($(t).find(".royalties"), e.total_royalties, e.currency_symbol), toggleLoaderDiv(t, "hide")
}

function createDetailedShirtList(e, t, a, s, l) {
    if (a = a || "", s = s || "", l = l || "template-small", e.length > 0) {
        var r = "",
            o = "",
            d = "";
        for ("template-small" == l ? d = '<div class="pretty-scrollbar" style="height: 323px; overflow: hidden; overflow-y: auto;">' + s + '<table class="table table-sm template-small shirts-list"><tbody>' : "template-full" != l && "template-full-with-checkbox" != l || (d = '<div class="clearfix" style=""><div class="pm_toolbar clearfix" data-target-table="' + t + ' .table.with-checkbox" style="margin: 5px 0 10px 0; position: relative"><div class="pm_btn_radio_container float-left clearfix" style="margin-right: 15px"><div class="pm_btn pm_select_all_rows"><i class="fa fa-check-square" style="line-height: 18px"></i> Select All</div> <div class="pm_btn pm_unselect_all_rows"><i class="fa fa-square-o" style="line-height: 18px"></i> Unselect All</div> </div><div class="pm_btn enable-when-rows-selected disabled batch-edit-products" style="margin-right: 12px;"><i class="fa fa-pencil" style="line-height: 18px"></i> Batch Edit</div> <div class="product-count float-left hidden"></div><div class="switch-wrapper clearfix" style="position:absolute; right:0; bottom:6px;" data-toggle="tooltip" data-html="true" title="Screenshot Mode<br/>Hides titles for screenshot"><i class="fa fa-eye-slash" style="margin-right:3px; cursor: help" ></i><div class="switch-container float-right"><label for="blur_switch_2"><input type="checkbox" id="blur_switch_2" class="hide-titles" ' + ($("#blur_switch").is(":checked") ? "checked" : "") + '/><span class="switch"></span><span class="toggle"></span></label></div></div></div><table class="table shirts-list template-full ' + ("template-full-with-checkbox" == l ? "with-checkbox pm-table-hover" : "") + '" data-toolbar="' + t + ' .pm_toolbar"><thead><tr>' + ("template-full-with-checkbox" == l ? '<th scope="col" class="pm-checkbox"></th>' : "") + '<th scope="col">&nbsp;</th><th scope="col">Title</th><th scope="col">Product</th><th scope="col">Sales</th><th scope="col">Returns</th><th scope="col">Royalties</th><th scope="col">Fit Type</th><th scope="col" colspan="2" style="position: relative">Color</th></tr></thead><tbody>'), $("#blur_switch").is(":checked") && (r = "blur-contents"), i = 0; i < e.length; i++) {
            var n = {},
                c = {},
                p = 0,
                m = "",
                u = "https://www.amazon" + e[i].marketplace_extension + "/dp/" + e[i].asin,
                v = "POP_SOCKET" == e[i].productType;
            if (e[i].variation_totals.color.length) {
                var f = e[i].variation_totals.color.sort((function(e, t) {
                    return t.total - e.total
                }));
                for (x = 0; x < f.length; ++x) n[f[x].variation] = f[x].total
            }
            if (n && Object.keys(n).forEach((function(e) {
                    var t = e.replace(/\//g, "_"),
                        a = toTitleCase(e.replace(/_/g, " "));
                    m += '<div class="colour-circle ' + t + '" title="' + a + '">' + n[e] + "</div>"
                })), e[i].variation_totals.fitType.length)
                for (x = 0; x < e[i].variation_totals.fitType.length; ++x) c[e[i].variation_totals.fitType[x].variation] = e[i].variation_totals.fitType[x].total;
            if (o = v ? '<div class="shirt-stats enabled" title="PopSockets"><div class="icon"><i class="fa fa-circle"></i></div><div class="number">' + e[i].net_sold + "</div></div>" : c.unisex ? '<div class="shirt-stats ' + (c.unisex ? "enabled" : "") + '" title="Unisex"><div class="icon"><i class="fa fa-user"></i></div><div class="number">' + (c.unisex ? c.unisex : 0) + "</div></div>" : '<div class="shirt-stats ' + (c.men ? "enabled" : "") + '" title="Men"><div class="icon"><i class="fa fa-male"></i></div><div class="number">' + (c.men ? c.men : 0) + '</div></div><div class="shirt-stats ' + (c.women ? "enabled" : "") + '" title="Women"><div class="icon"><i class="fa fa-female"></i></div><div class="number">' + (c.women ? c.women : 0) + '</div></div><div class="shirt-stats ' + (c.kids ? "enabled" : "") + '" title="Kids" style="margin-right:0"><div class="icon"><i class="fa fa-child"></i></div><div class="number">' + (c.kids ? c.kids : 0) + "</div></div>", "template-small" == l) {
                var h = ".todays-shirts-list" == t;
                d += '<tr data-merchandiseid="' + e[i].merchandiseId + '" data-asin="' + e[i].asin + '" data-listing-Id="" data-identifier ="' + e[i].asin + '" data-keywords="' + findKeywordsFromTitle(e[i].asinName) + '" data-productType="' + e[i].pretty_productType.replace(/\s+/g, "_").toLowerCase() + '"data-marketplace="' + e[i].marketplace_code + '" class="pm-product-container-with-img"><td style="width:65px;" class="text-center num-sales"><div class="header-stats" style="padding: 0"><div class="number">' + (e[i].net_just_sold || e[i].net_just_returned ? '<div class="latest-sale-circle" title="Latest sale"></div>' : "") + e[i].net_sold + '</div><div class="royalties ' + royaltiesTaxClass() + '" style="margin-top:3px" title="' + royaltiesTitleText(e[i].royalties.value, e[i].currency_symbol) + '">' + e[i].currency_symbol + parseFloat(e[i].royalties.value).toFixed(2) + royaltiesTaxIcon() + '</div></div></td><td class="pm-product-row-img-cell text-center" style="padding: 3px;"><div class="pm-product-row-img-container"><img class="pm-product-row-img pm-load-product-img hide-in-screenshot ' + r + '" src="" data-toggle="popover" data-boundary="viewport" data-content="" data-html="true" data-trigger="hover" data-placement="top"></div></td><td style="" class=""><div class="hide-in-screenshot ' + r + '" style="line-height: 18px;"><a href="' + u + '" target="_blank" title="' + e[i].asinName + '">' + e[i].asinName + '</a></div><div style="font-size: 10px; text-transform: uppercase; color: #a5a5a5; line-height: 10px; margin-top: 4px;">' + e[i].pretty_productType + "</div>" + (h && e[i].unitsReturned > 0 ? '<div style="font-size: 10px; text-transform: uppercase; color: orange; line-height: 10px; margin-top: 5px;">' + e[i].unitsReturned + " Returned</div>" : "") + '</td><td style="min-width: 145px"><div class="" style="padding-left:2px; white-space: nowrap;">' + o + '</div><div style="margin-top: 2px">' + m + '</div></td><td style="text-align: center"><div class="btn btn-light btn-sm btn-icon edit-product" data-toggle="tooltip" data-boundary="viewport" data-html="true" title="Edit" data-identifier="' + e[i].asin + '"><i class="fa fa-pencil" style=""></i></div></td></tr>'
            } else "template-full" != l && "template-full-with-checkbox" != l || (p = e[i].royalties.value > 0 ? e[i].currency_symbol + parseFloat(e[i].royalties.value / e[i].net_sold).toFixed(2) : "&nbsp;", d += '<tr data-merchandiseid="' + e[i].merchandiseId + '" data-asin="' + e[i].asin + '" data-listing-Id="" data-identifier ="' + e[i].asin + '" data-keywords="' + findKeywordsFromTitle(e[i].asinName) + '" data-productType="' + e[i].pretty_productType.replace(/\s+/g, "_").toLowerCase() + '"data-marketplace="' + e[i].marketplace_code + '" class="pm-product-container-with-img">' + ("template-full-with-checkbox" == l ? '<td class="pm-checkbox" style="position:relative"><input type="checkbox" class="magic-checkbox select-row" id="' + a + "_" + e[i].asin + '"/><label style="position:relative" class="" for="' + a + "_" + e[i].asin + '"></label></td>' : "") + '<td class="pm-product-row-img-cell text-center" style="padding: 3px;"><div class="pm-product-row-img-container"><img class="pm-product-row-img pm-load-product-img hide-in-screenshot ' + r + '" src="" data-toggle="popover" data-boundary="viewport" data-content="" data-html="true" data-trigger="hover" data-placement="top"></div></td><td style="" class=""><div class="hide-in-screenshot ' + r + '" style=""><a href="' + u + '" target="_blank" title="' + e[i].asinName + '">' + e[i].asinName + '</a></div><div class="sub-text hide-in-screenshot ' + r + '" style="" title="Product ASIN">' + e[i].asin + '</div></td><td style="" class="light-text">' + e[i].pretty_productType.replace(/-/gi, "&#8209;") + '</td><td style="padding: 0" class="text-center"><div class="main-text" style="width: 70px; font-weight: 900">' + e[i].net_sold + '</div><div class="sub-text" style="" title="Sold - Cancelled">' + e[i].unitsSold + " - " + e[i].unitsCancelled + '</div></td><td style="" class="text-center"><div class="main-text" style="' + (e[i].unitsReturned > 0 ? "font-weight: bold" : "color: #d1d1d1") + '">' + e[i].unitsReturned + '</div><div class="sub-text">&nbsp;</div></td><td style="" class="text-center"><div class="main-text ' + royaltiesTaxClass() + '" style="font-weight: 600" title="' + royaltiesTitleText(e[i].royalties.value, e[i].currency_symbol) + '">' + e[i].currency_symbol + parseFloat(e[i].royalties.value).toFixed(2) + royaltiesTaxIcon() + '</div><div class="sub-text" style="" title="Avg. royalties per sale">' + p + '</div></td><td style=""><div style="min-width: 125px; white-space: nowrap;">' + o + '</div></td><td style=""><div style="width: 140px">' + m + '</div></td><td style=""><div class="btn btn-light btn-sm btn-icon edit-product" data-toggle="tooltip" data-boundary="viewport" data-html="true" title="Edit" data-identifier="' + e[i].asin + '"><i class="fa fa-pencil" style=""></i></div></td></tr>')
        }
        d += "</tbody> </table> </div>"
    } else if ("template-small" == l) d = '<div style="height: 323px; position: relative;"><div class="no-sales-message" style="position: absolute; width: 100%; text-align: center; padding-top: 10px; z-index: 1;"><div class="title" style="font-size: 20px; font-weight: 600; border:none;">No sales yet</div><div class="text" style="font-size: 14px; color: #656565">Hang in there... We\'ll notify you<br/>the moment you make a sale!</div></div><div class="" style="text-align:center"><img src="' + chrome.extension.getURL("/assets/img/jack-fishing.gif") + '" style="opacity: 0.45; width: 520px"></div></div>';
    else if ("template-full" == l || "template-full-with-checkbox" == l) d = '<div class="no-sales-message" style="text-align: center; margin: 15px 0;"><div class="title" style="font-size: 38px; font-weight: 600; color: #757575; line-height: 1">No sales</div><div class="text" style="font-size: 18px; color: #959595; line-height: 1.2; margin: 15px 0;">It looks like you didn\'t sell any products<br/>in the selected period</div><img src="' + chrome.extension.getURL("/assets/img/no-sales-grin.png") + '" style="height: 200px; opactiy: 0.8;"></div>';
    $(t).html(d), $(t).find('[data-toggle="tooltip"]').tooltip(), showProductImages($(t))
}

function updatetopSellerSummary(e) {
    var t = e.result_container;
    if (void 0 !== e[selected_marketplace.country_code].top_sellers && "" != e[selected_marketplace.country_code].top_sellers) {
        createDetailedShirtList(e[selected_marketplace.country_code].top_sellers, t + " .top-sales-list", "top-sales-list", '<div class="info-small text-center">Shirts which sold the most units in the last 30 days</div>')
    } else {
        var a = '<div class="" style="text-align: center; margin: 15px 0;"><div class="text" style="font-size: 14px; color: #959595; line-height: 1.5; padding-top: 25px;">It looks like you didn\'t sell any products<br/>in the last 30 days</div></div>';
        $(t + " .top-sales-list").html(a)
    }
    if (void 0 !== e[selected_marketplace.country_code].top_royalties && "" != e[selected_marketplace.country_code].top_royalties) {
        createDetailedShirtList(e[selected_marketplace.country_code].top_royalties, t + " .top-royalties-list", "top-royalties-list", '<div class="info-small text-center">Shirts which made the most royalties in the last 30 days</div>')
    } else {
        a = '<div class="" style="text-align: center; margin: 15px 0;"><div class="text" style="font-size: 14px; color: #959595; line-height: 1.5; padding-top: 25px;">It looks like you didn\'t sell any products<br/>in the last 30 days</div></div>';
        $(t + " .top-royalties-list").html(a)
    }
    toggleLoaderDiv(t, "hide")
}

function showSalesModal(e, t, a, s) {
    s = s || "#salesModal .shirt-list", $("#salesModal .modal-title").html(""), $("#salesModal .chart-summary-container").addClass("hidden"), $("#salesModal .shirt-list").html(""), $("#salesModal .sales").html("0"), $("#salesModal .sold-cancelled").html("0 - 0"), $("#salesModal .returned").html("0"), $("#salesModal .royalties .number").html("0"), $("#salesModal .royalties .decimal").html("00"), $("#salesModal .revenue").html("0"), $("#salesModal .royalties-per-sale .number").html("0"), $("#salesModal .royalties-per-sale .decimal").html("00"), $("#salesModal .chart-summary-container .top-products").html(""), $("#salesModal .chart-summary-container .top-fit-types").html(""), $("#salesModal .chart-summary-container .top-colors").html(""), showModal("#salesModal");
    var i = {
        get_sales_summary: !0,
        period: e,
        startDate: t,
        endDate: a,
        target_container: s
    };
    chrome.extension.sendMessage(i, (function(t) {
        if (t)
            if ($("#salesModal .modal-title").html("Sales: " + t.title_date, ""), t.net_sales > 0 || t.total_returned > 0) {
                $("#salesModal .chart-summary-container").removeClass("hidden"), $("#salesModal .chart-summary .currency-symbol").html(t.currency_symbol), $("#salesModal .sales").html(t.net_sales), $("#salesModal .sold-cancelled").html(t.total_sales + " - " + t.total_cancelled), $("#salesModal .returned").html(t.total_returned);
                var a = parseFloat(t.total_royalties).toFixed(3);
                $("#salesModal .royalties .number").html(Math.trunc(a)), $("#salesModal .royalties .decimal").html((Math.abs(a) % 1).toFixed(3).substring(1, 4)), formatRoyaltiesElement($("#salesModal .chart-summary-container .royalties"), a, t.currency_symbol), $("#salesModal .revenue").html(parseFloat(t.total_revenue).toFixed(2));
                var i = 0,
                    l = 0,
                    r = 0;
                if (i = "all-time" == e ? t.net_sales - t.total_returned : t.net_sales, t.total_royalties > 0 && (l = (t.total_royalties / i).toFixed(3)), $("#salesModal .royalties-per-sale .number").html(i > 0 ? Math.trunc(l) : 0), $("#salesModal .royalties-per-sale .decimal").html(i > 0 ? (Math.abs(l) % 1).toFixed(3).substring(1, 4) : ".00"), t.variation_totals.productType) {
                    var o = "",
                        d = t.variation_totals.productType.sort((function(e, t) {
                            return t.total - e.total
                        }));
                    for (x = 0; x < d.length; ++x) o += '<div class="custom-progress yellow"><div class="text-line clearfix"><div class="text">' + d[x].variation.replace(/_/g, " ").toLowerCase() + '</div><div class="number">' + Math.round(d[x].total / t.net_sales * 100) + '%<span class="light-number">(' + d[x].total + ')</span></div></div><div class="progress"><div class="progress-bar" style="width:' + d[x].total / t.net_sales * 100 + '%"></div></div></div>', "popsockets" == d[x].variation && (r = d[x].total);
                    $("#salesModal .chart-summary-container .top-products").append(o)
                }
                if (t.variation_totals.fitType) {
                    o = "";
                    var n = t.variation_totals.fitType.sort((function(e, t) {
                            return t.total - e.total
                        })),
                        c = t.net_sales - r;
                    for (x = 0; x < n.length; ++x) o += '<div class="custom-progress blue"><div class="text-line clearfix"><div class="text">' + n[x].variation + '</div><div class="number">' + Math.round(n[x].total / c * 100) + '%<span class="light-number">(' + n[x].total + ')</span></div></div><div class="progress"><div class="progress-bar" style="width:' + n[x].total / c * 100 + '%"></div></div></div>';
                    $("#salesModal .chart-summary-container .top-fit-types").append(o)
                }
                if (t.variation_totals.color) {
                    var p = "",
                        m = t.variation_totals.color.sort((function(e, t) {
                            return t.total - e.total
                        }));
                    for (x = 0; x < m.length; ++x) {
                        p += '<div class="colour-circle ' + m[x].variation.replace(/\//g, "_") + '" data-toggle="tooltip" title="' + toTitleCase(m[x].variation.replace(/_/g, " ")) + '">' + m[x].total + "</div>"
                    }
                    $("#salesModal .chart-summary-container .top-colors").append(p)
                }
                var u = t.product_list.length > 100 ? 100 : t.product_list.length;
                if (createDetailedShirtList(t.product_list.sort((function(e, t) {
                        return t.net_sold - e.net_sold
                    })).slice(0, u), s, "sales_modal", "", "template-full-with-checkbox"), t.product_list.length > 0) {
                    var v = t.product_list.length > 100 ? "Showing Top 100 of " + t.product_list.length : t.product_list.length;
                    $("#salesModal .shirt-list").append("<div class='' style='font-style: italic; color: #757575; text-align: center; margin-top: 5px;'>" + v + " unique products sold</div>")
                }
            } else $("#salesModal .shirt-list").html("<div style='text-align: center'>There were no sales for the selected period</>");
        else $("#salesModal .shirt-list").html("<div style='text-align: center'>There was an error fetching sales.<br/>Please reload the page and try again...</>");
        $("#salesModal").find('[data-toggle="tooltip"]').tooltip()
    }))
}

function showSalesChartModal() {
    var e = {},
        t = !1;
    showModal("#chartModal");
    chrome.extension.sendMessage({
        get_all_time_sales: !0,
        progress_container: "#chartModal .modal-body"
    }, (function(a) {
        var s = JSON.parse(JSON.stringify(a.market_totals)),
            i = JSON.parse(JSON.stringify(a.chart_data));
        $("#chartModal .modal-title").html("Sales: All Time"), $("#chartModal .chart-summary .currency-symbol").html(s.currency_symbol), $("#chartModal .sales").html(s.net_sales), $("#chartModal .sold-cancelled").html(s.total_sold + " - " + s.total_cancelled), $("#chartModal .returned").html(s.total_returned);
        var l = s.total_royalties.toFixed(3);
        $("#chartModal .royalties .number").html(Math.trunc(l)), $("#chartModal .royalties .decimal").html((Math.abs(l) % 1).toFixed(3).substring(1, 4)), formatRoyaltiesElement($("#chartModal .royalties"), s.total_royalties, s.currency_symbol), $("#chartModal .revenue").html(s.total_revenue.toFixed(2));
        var r = s.net_sales - s.total_returned,
            o = 0;
        if (s.total_royalties > 0 && (o = (s.total_royalties / r).toFixed(3)), $("#chartModal .royalties-per-sale .number").html(r > 0 ? Math.trunc(o) : 0), $("#chartModal .royalties-per-sale .decimal").html(r > 0 ? (Math.abs(o) % 1).toFixed(3).substring(1, 4) : ".00"), $("#chartModal .your-share").html(s.total_royalties > 0 ? (s.total_royalties / s.total_revenue * 100).toFixed(0) : 0), $("#chartModal .amazons-share").html(s.total_royalties > 0 ? (100 * (1 - s.total_royalties / s.total_revenue)).toFixed(0) : 0), e.chart_labels = [], e.chart_data_sales = [], e.chart_data_royalties = [], i.soldData.length < 13) {
            var d = 13 - i.soldData.length,
                n = moment(i.datesData[i.datesData.length - 1]).subtract(12, "months").format("YYYY-MM-DD");
            for (x = 0; x < 13; ++x) e.chart_labels[x] = moment(n).add(x, "months").format("YYYY-MM-DD"), e.chart_data_sales[x] = x < d ? 0 : i.soldData[x - d], e.chart_data_royalties[x] = x < d ? 0 : i.royaltiesData[x - d];
            i.datesData = e.chart_labels, i.netSoldData = e.chart_data_sales, i.royaltiesData = e.chart_data_royalties
        } else t = 72 * (i.soldData.length - -1);
        i.currency_symbol = s.currency_symbol;
        var c = {};
        c[a.market_code] = i, c.result_container = "sales_chart", createChart(c), t && ($("#chartModal .chart_container").css("width", t), $("#chartModal .chart_outer_container").scrollLeft(t))
    }))
}

function createChart(e, t) {
    t = t || !1;
    var a = e.result_container,
        s = [],
        i = "",
        l = $("#" + a).data("display"),
        r = {},
        o = {},
        d = [],
        n = [],
        c = [],
        p = {
            usa: {
                sales_label_color: "#2385c7",
                royalties_label_color: "#ef355c",
                pointBorderColor: "rgba(255, 99, 132, 1)",
                pointBackgroundColor: "rgba(255, 224, 230, 1)",
                borderColor: "rgb(54, 162, 235)",
                backgroundColor: "rgba(54, 162, 235, 0.2)"
            },
            uk: {
                sales_label_color: "#1fa2a2",
                royalties_label_color: "#e1a91f",
                pointBorderColor: "rgba(234, 184, 61, 1)",
                pointBackgroundColor: "rgba(255, 206, 86, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)"
            },
            ger: {
                sales_label_color: "#824bf1",
                royalties_label_color: "#f78b20",
                pointBorderColor: "rgba(255, 159, 64, 1)",
                pointBackgroundColor: "rgba(255, 159, 64, 0.2)",
                borderColor: "rgba(153, 102, 255, 1)",
                backgroundColor: "rgba(153, 102, 255, 0.2)"
            },
            fr: {
                sales_label_color: "#668de5",
                royalties_label_color: "#ff96e3",
                pointBorderColor: "rgba(255, 150, 227, 1)",
                pointBackgroundColor: "rgba(255, 150, 227, 0.2)",
                borderColor: "rgb(102, 141, 229)",
                backgroundColor: "rgba(102, 141, 229, 0.2)"
            },
            it: {
                sales_label_color: "#42ce71",
                royalties_label_color: "#898cff",
                pointBorderColor: "rgba(137, 140, 255, 1)",
                pointBackgroundColor: "rgba(137, 140, 255, 0.2)",
                borderColor: "rgba(66, 206, 113, 1)",
                backgroundColor: "rgba(66, 206, 113, 0.2)"
            },
            es: {
                sales_label_color: "#ecb637",
                royalties_label_color: "#668de5",
                pointBorderColor: "rgba(102, 141, 229, 1)",
                pointBackgroundColor: "rgba(102, 141, 229, 0.2)",
                borderColor: "rgba(236, 182, 55, 1)",
                backgroundColor: "rgba(255, 220, 137, 0.2)"
            },
            jp: {
                sales_label_color: "#b51a1a",
                royalties_label_color: "#40869a",
                pointBorderColor: "rgba(113, 180, 199, 1)",
                pointBackgroundColor: "rgba(113, 180, 199, 0.2)",
                borderColor: "rgba(243, 84, 84, 1)",
                backgroundColor: "rgba(243, 84, 84, 0.2)"
            },
            default: {
                sales_label_color: "#757575",
                royalties_label_color: "#757575",
                pointBorderColor: "rgb(201, 203, 207)",
                pointBackgroundColor: "rgba(244, 245, 245, 1)",
                borderColor: "rgb(201, 203, 207)",
                backgroundColor: "rgba(201, 203, 207, 0.2)"
            }
        },
        m = 0,
        u = "monthly" == l ? moment().startOf("month").format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
    G_MARKETPLACE_ORDER_CODE.forEach((function(a, l, c) {
        if (e[a]) {
            var v = jQuery.extend(!0, {}, e[a]),
                f = [],
                h = [],
                g = [],
                b = [],
                _ = [],
                y = [];
            m++, i = 1 == m ? v.currency_symbol : "", v.royaltiesData = v.royaltiesData.map((function(e, t, a) {
                return e.toFixed(2)
            })), s.length != v.datesData.length && (s = v.datesData), s.forEach((function(e, t, s) {
                t == s.length - 1 && e == u ? (f.push(p.default.sales_label_color), h.push(p.default.royalties_label_color), g.push(p.default.pointBorderColor), b.push(p.default.pointBackgroundColor), _.push(p.default.borderColor), y.push(p.default.backgroundColor)) : (f.push(p[a].sales_label_color), h.push(p[a].royalties_label_color), g.push(p[a].pointBorderColor), b.push(p[a].pointBackgroundColor), _.push(p[a].borderColor), y.push(p[a].backgroundColor))
            })), r = {
                hidden: !G_IS_PRO,
                label: "Royalties",
                data: v.royaltiesData,
                currency_symbol: v.currency_symbol,
                marketplace_code: a.toUpperCase(),
                hide_labels: t,
                label_color: h,
                show_order: 2 * m,
                yAxisID: "y-axis-r",
                type: "line",
                fill: !1,
                showLine: !0,
                lineTension: 0,
                borderColor: g,
                borderWidth: 1,
                pointBackgroundColor: b,
                pointBorderColor: g,
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 4
            }, o = {
                label: "Sold",
                data: v.netSoldData,
                yAxisID: "y-axis-l",
                marketplace_code: a.toUpperCase(),
                hide_labels: t,
                show_order: 2 * m - 1,
                label_color: f,
                backgroundColor: y,
                borderColor: _,
                borderWidth: 1
            }, d.push(r), n.push(o)
        }
    })), c = (c = c.concat(d)).concat(n);
    var v = document.getElementById(a).getContext("2d");
    chartContainers[a] && chartContainers[a].destroy(), chartContainers[a] = new Chart(v, {
        type: "roundedBar",
        data: {
            labels: s,
            datasets: c
        },
        options: {
            maintainAspectRatio: !1,
            barRoundness: .26,
            animation: {
                duration: 0
            },
            scales: {
                yAxes: [{
                    id: "y-axis-l",
                    position: "left",
                    gridLines: {
                        zeroLineColor: "rgba(201, 203, 207, 1)",
                        color: "rgba(201, 203, 207, 0.4)"
                    },
                    ticks: {
                        beginAtZero: !0,
                        callback: function(e) {
                            if (e % 1 == 0) return e
                        }
                    }
                }, {
                    display: G_IS_PRO,
                    id: "y-axis-r",
                    position: "right",
                    gridLines: {
                        display: !1,
                        color: "rgba(201, 203, 207, 1)"
                    },
                    ticks: {
                        beginAtZero: !0,
                        callback: function(e) {
                            if (e % 1 == 0) return i + e
                        }
                    }
                }],
                xAxes: [{
                    gridLines: {
                        zeroLineColor: "rgba(201, 203, 207, 1)",
                        color: "transparent"
                    },
                    ticks: {
                        beginAtZero: !0,
                        callback: function(e, t, a) {
                            var s = "";
                            return "daily" == l ? s = moment(e).format("ddd") + ", " + moment(e).format("M/D") : "monthly" == l && (s = moment(e).format("MMM") + " " + moment(e).format("YY")), s
                        }
                    }
                }]
            },
            legend: {
                display: !1
            },
            tooltips: {
                enabled: G_IS_PRO,
                intersect: !1,
                mode: "index",
                positon: "average",
                itemSort: function(e, t, a) {
                    return a.datasets[e.datasetIndex].show_order - a.datasets[t.datasetIndex].show_order
                },
                callbacks: {
                    afterTitle: function(e, t) {
                        var a = this._chart.canvas.id,
                            s = $("#" + a).data("display"),
                            i = "daily" == s ? "day" : "month";
                        return !!(t.labels[e[0].index] == ("monthly" == s ? moment().startOf("month").format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"))) && "(incomplete " + i + ")"
                    },
                    label: function(e, t) {
                        var a = t.datasets[e.datasetIndex].label,
                            s = t.datasets[e.datasetIndex].data[e.index];
                        (m > 1 && (a += " [" + t.datasets[e.datasetIndex].marketplace_code + "]"), a.includes("Royalties")) && (s = t.datasets[e.datasetIndex].currency_symbol + parseFloat(s).toFixed(2));
                        return a + ": " + s
                    },
                    footer: function(e, t) {
                        return !!G_IS_PRO && "Click to view sales"
                    }
                },
                backgroundColor: "#fdfdfd",
                borderColor: "#d1d1d1",
                borderWidth: 1,
                titleFontFamily: "Lato",
                titleFontSize: 13,
                titleMarginBottom: 15,
                titleFontColor: "#333333",
                bodyFontFamily: "Lato",
                bodyFontColor: "#333333",
                bodyFontSize: 14,
                bodySpacing: 10,
                footerFontFamily: "Lato",
                footerFontSize: 12,
                footerFontStyle: "normal",
                footerFontColor: "#757575",
                footerMarginTop: 13
            },
            hover: {
                intersect: !1,
                onHover: function(e, t) {
                    var a = this.getElementAtEvent(e);
                    $("#" + e.srcElement.id).css("cursor", a[0] ? "pointer" : "default")
                }
            },
            onClick: function(e, t) {
                if (G_IS_PRO) {
                    var a = this.getElementAtEvent(e);
                    if (a.length > 0) {
                        var s = a[0]._chart.canvas.id,
                            i = $("#" + s).data("display"),
                            l = (a[0]._chart.config.data.datasets[a[0]._datasetIndex].marketplace_code.toLowerCase(), a[0]._chart.config.data.labels[a[0]._index]),
                            r = 0,
                            o = 0;
                        "daily" == i ? (r = moment(l).startOf("day").valueOf(), o = moment(l).startOf("day").valueOf()) : "monthly" == i && (r = moment(l).startOf("month").valueOf(), o = moment(l).endOf("month").startOf("day").valueOf()), showSalesModal("custom", r, o)
                    }
                } else showAvailableInProMessage("chart_click")
            }
        }
    })
}

function updateSalesChart(e) {
    var t = e.data.net_sales,
        a = e.data.total_royalties,
        s = chartContainers[e.result_container];
    s && (s.options.animation.duration = 750, s.data.datasets[1].data[s.data.datasets[1].data.length - 1] = t, s.data.datasets[0].data[s.data.datasets[0].data.length - 1] = a, s.update())
}
var x_test = 0;

function updateProductList(e, t) {
    var a = $("#manage-products-containter"),
        s = $(".manage-products-table-container"),
        i = !1;

    function l(t) {
        G_PRODUCT_LIST_IS_READY = !1, G_PRODUCT_LIST = {
            lastUpdate: e.lastUpdate,
            products_list: [],
            product_count: e.product_count,
            other_data: {
                product_types: []
            }
        }, e.products_list.forEach((function(e, t, a) {
            G_PRODUCT_LIST.products_list.push(jQuery.extend(!0, {}, e))
        })), e.other_data.product_types.forEach((function(e, t, a) {
            G_PRODUCT_LIST.other_data.product_types.push(e)
        })), G_PRODUCT_LIST_IS_READY = !0, t()
    }

    function r() {
        s.data("sort-by", "updatedDate"), s.data("sort-order", "desc"), s.data("search-query", ""), s.data("filter-search_text_in", "title"), s.data("filter-marketplace", "all"), s.data("filter-product", "all"), s.data("filter-status", "all"), s.data("filter-is_buyable", "all"), s.data("filter-has_sales", "all"), s.data("filter-pending_removal", "all"), s.data("filter-price", "all"), s.data("filter-published_date", "all"), s.data("filter-reviews", "all"), s.data("filter-bsr", "all");
        var e, t, l, r = 0,
            o = 15,
            d = [],
            n = "";

        function c(e, t, a) {
            ++x_test, t = t || !1, a = a || 0, r = 0, d = [];
            var l = moment().startOf("day").valueOf(),
                n = [];
            e.forEach((function(e, t, a) {
                e.pm_data.asin_with_markup = e.pm_data.asin_with_markup ? e.pm_data.asin_with_markup : e.asin, n.push(jQuery.extend(!0, {}, e))
            }));
            var c = {
                    sort_by: s.data("sort-by"),
                    sort_order: s.data("sort-order"),
                    search_query: s.data("search-query").trim().toLowerCase(),
                    search_text_in: s.data("filter-search_text_in"),
                    filter_marketplace: s.data("filter-marketplace"),
                    filter_product: s.data("filter-product"),
                    filter_status: s.data("filter-status"),
                    filter_is_buyable: s.data("filter-is_buyable"),
                    filter_has_sales: s.data("filter-has_sales"),
                    filter_pending_removal: s.data("filter-pending_removal"),
                    filter_price: s.data("filter-price"),
                    filter_published_date: s.data("filter-published_date"),
                    filter_reviews: s.data("filter-reviews"),
                    filter_bsr: s.data("filter-bsr")
                },
                p = "";
            if (n.length > 0) {
                var m = "",
                    u = $("#blur_switch").is(":checked"),
                    v = "",
                    f = "";
                u && (m = "blur-contents"), v = '<div class="sticky-toolbar clearfix"><div class="product-count" style="margin-bottom: 18px; padding-top: 8px;"><span class="total-proucts-shown"><span class="number">0</span> products&nbsp;</span><span class="filtered-products-shown hidden">of <span class="number">0</span></span><div class="switch-wrapper float-right clearfix" data-toggle="tooltip" data-html="true" title="Screenshot Mode<br/>Hides titles for screenshot"><i class="fa fa-eye-slash" style="margin-right:3px; cursor: help" ></i><div class="switch-container float-right"><label for="blur_switch_3"><input type="checkbox" id="blur_switch_3" class="hide-titles" ' + (u ? "checked" : "") + '/><span class="switch"></span><span class="toggle"></span></label></div></div></div><div class="manage-products-table-actions pm_toolbar clearfix" data-target-table=".manage-products-table-container .table.shirts-list" style="margin: 5px 0 10px 0; position: relative"><div class="pm_btn_radio_container float-left clearfix" style="margin-right: 15px"><div class="pm_btn pm_select_all_rows" title="Select All" data-toggle="tooltip"><i class="fa fa-check-square" style="line-height: 18px"></i></div> <div class="pm_btn pm_unselect_all_rows" title="Un-select All" data-toggle="tooltip"><i class="fa fa-square-o" style="line-height: 18px"></i></div> </div><div class="pm_btn enable-when-rows-selected disabled batch-edit-products" style="margin-right: 6px;"><i class="fa fa-pencil" style="line-height: 18px"></i> Edit</div> <div class="pm_btn pm_btn_red enable-when-rows-selected disabled batch-delete-products" style="margin-right: 12px;"><i class="fa fa-trash" style="line-height: 18px"></i> Delete</div> <div class="product-count float-left hidden"></div><div class="pm_btn_radio_container float-right clearfix" style=""><div class="pm_btn update-products-table" data-toggle="tooltip" data-html="true" data-title="<div style=\'\'><div>Quick Refresh</div><div style=\'font-size:14px\'>Refresh products which have been edited</div></div>"><i class="fa fa-refresh" style="line-height: 18px"></i> Refresh</div> <div class="pm_btn update-products-meta-data" data-toggle="tooltip" data-html="true" data-title="<div style=\'\'><div>Refresh Listing Data</div><div style=\'font-size:14px\'>Updates Reviews and BSR</div></div>"><i class="fa fa-list-ul" style="line-height: 18px"></i></div> <div class="pm_btn update-products-table no-cache" data-toggle="tooltip" data-html="true" data-title="<div style=\'\'><div>Full Refresh</div><div style=\'font-size:14px\'>Delete and re-index Product Database (takes longer)</div></div>"><i class="fa fa-cloud-download" style="line-height: 18px"></i></div> </div></div></div>', v += '<div class="manage-products-table-wrapper pm_products_scrollbar"><table class="table shirts-list with-checkbox pm-table-hover template-full" data-toolbar=".manage-products-table-actions.pm_toolbar" style="padding-top:0"><thead><tr style="height: 46px;"><th scope="col" class="freeze-column-left" style="padding: 3px"><div style="width: 110px"></div></th><th scope="col" class="sortable ' + ("productTitle" == c.sort_by ? "sorted" : "") + '" data-sort-by="productTitle" data-sort-order="' + ("productTitle" == c.sort_by ? "desc" == c.sort_order ? "desc" : "asc" : "") + '"><div style="width: 370px">Title<i class="fa ' + ("productTitle" == c.sort_by ? "desc" == c.sort_order ? "fa-sort-amount-desc" : "fa-sort-amount-asc" : "fa-sort") + '"></i></div></th><th scope="col" class="sortable ' + ("pm_data.product_type" == c.sort_by ? "sorted" : "") + '" data-sort-by="pm_data.product_type" data-sort-order="' + ("pm_data.product_type" == c.sort_by ? "desc" == c.sort_order ? "desc" : "asc" : "") + '"><div style="width: 100px">Product<i class="fa ' + ("pm_data.product_type" == c.sort_by ? "desc" == c.sort_order ? "fa-sort-amount-desc" : "fa-sort-amount-asc" : "fa-sort") + '"></i></div></th><th scope="col" class="sortable ' + ("pm_data.status" == c.sort_by ? "sorted" : "") + '" data-sort-by="pm_data.status" data-sort-order="' + ("pm_data.status" == c.sort_by ? "desc" == c.sort_order ? "desc" : "asc" : "") + '"><div style="width: 95px">Status<i class="fa ' + ("pm_data.status" == c.sort_by ? "desc" == c.sort_order ? "fa-sort-amount-desc" : "fa-sort-amount-asc" : "fa-sort") + '"></i></div></th><th scope="col" class="sortable ' + ("updatedDate" == c.sort_by ? "sorted" : "") + '" data-sort-by="updatedDate" data-sort-order="' + ("updatedDate" == c.sort_by ? "desc" == c.sort_order ? "desc" : "asc" : "") + '"><div style="width: 108px">Updated<i class="fa ' + ("updatedDate" == c.sort_by ? "desc" == c.sort_order ? "fa-sort-amount-desc" : "fa-sort-amount-asc" : "fa-sort") + '"></i></div></th><th scope="col" class="sortable ' + ("createdDate" == c.sort_by ? "sorted" : "") + '" data-sort-by="createdDate" data-sort-order="' + ("createdDate" == c.sort_by ? "desc" == c.sort_order ? "desc" : "asc" : "") + '"><div style="width: 108px">Created<i class="fa ' + ("createdDate" == c.sort_by ? "desc" == c.sort_order ? "fa-sort-amount-desc" : "fa-sort-amount-asc" : "fa-sort") + '"></i></div></th><th scope="col" class="text-center sortable ' + ("listPrice" == c.sort_by ? "sorted" : "") + '" data-sort-by="listPrice" data-sort-order="' + ("listPrice" == c.sort_by ? "desc" == c.sort_order ? "desc" : "asc" : "") + '"><div style="width: 80px">Price<i class="fa ' + ("listPrice" == c.sort_by ? "desc" == c.sort_order ? "fa-sort-amount-desc" : "fa-sort-amount-asc" : "fa-sort") + '"></i></div></th><th scope="col" class="sortable ' + ("pm_data.sales.total_net_sold" == c.sort_by ? "sorted" : "") + '" data-sort-by="pm_data.sales.total_net_sold" data-sort-order="' + ("pm_data.sales.total_net_sold" == c.sort_by ? "desc" == c.sort_order ? "desc" : "asc" : "") + '"><div style="width: 110px">Total Sold<i class="fa ' + ("pm_data.sales.total_net_sold" == c.sort_by ? "desc" == c.sort_order ? "fa-sort-amount-desc" : "fa-sort-amount-asc" : "fa-sort") + '"></i></div></th><th scope="col" class="sortable ' + ("pm_data.sales.total_royalties" == c.sort_by ? "sorted" : "") + '" data-sort-by="pm_data.sales.total_royalties" data-sort-order="' + ("pm_data.sales.total_royalties" == c.sort_by ? "desc" == c.sort_order ? "desc" : "asc" : "") + '"><div style="width: 110px">Royalties<i class="fa ' + ("pm_data.sales.total_royalties" == c.sort_by ? "desc" == c.sort_order ? "fa-sort-amount-desc" : "fa-sort-amount-asc" : "fa-sort") + '"></i></div></th><th scope="col" class="sortable ' + ("pm_data.sales.date_of_last_sale" == c.sort_by ? "sorted" : "") + '" data-sort-by="pm_data.sales.date_of_last_sale" data-sort-order="' + ("pm_data.sales.date_of_last_sale" == c.sort_by ? "desc" == c.sort_order ? "desc" : "asc" : "") + '"><div style="width: 108px">Last Sale<i class="fa ' + ("pm_data.sales.date_of_last_sale" == c.sort_by ? "desc" == c.sort_order ? "fa-sort-amount-desc" : "fa-sort-amount-asc" : "fa-sort") + '"></i></div></th><th scope="col" class="sortable ' + ("pm_data.reviews.num_of_reviews" == c.sort_by ? "sorted" : "") + '" data-sort-by="pm_data.reviews.num_of_reviews" data-sort-order="' + ("pm_data.reviews.num_of_reviews" == c.sort_by ? "desc" == c.sort_order ? "desc" : "asc" : "") + '"><div style="width: 125px">Reviews<i class="fa ' + ("pm_data.reviews.num_of_reviews" == c.sort_by ? "desc" == c.sort_order ? "fa-sort-amount-desc" : "fa-sort-amount-asc" : "fa-sort") + '"></i></div></th><th scope="col" class="sortable ' + ("pm_data.bsr.bsr_val_clean" == c.sort_by ? "sorted" : "") + '" data-sort-by="pm_data.bsr.bsr_val_clean" data-sort-order="' + ("pm_data.bsr.bsr_val_clean" == c.sort_by ? "desc" == c.sort_order ? "desc" : "asc" : "") + '"><div style="width: 120px">BSR<i class="fa ' + ("pm_data.bsr.bsr_val_clean" == c.sort_by ? "desc" == c.sort_order ? "fa-sort-amount-desc" : "fa-sort-amount-asc" : "fa-sort") + '"></i></div></th><th scope="col" class="sortable ' + ("estimatedExpirationDate" == c.sort_by ? "sorted" : "") + '" data-sort-by="estimatedExpirationDate" data-sort-order="' + ("estimatedExpirationDate" == c.sort_by ? "desc" == c.sort_order ? "desc" : "asc" : "") + '"><div style="width: 80px; cursor: help" title="Days to Removal">DTR<i class="fa ' + ("estimatedExpirationDate" == c.sort_by ? "desc" == c.sort_order ? "fa-sort-amount-desc" : "fa-sort-amount-asc" : "fa-sort") + '"></i></div></th><th scope="col" class="freeze-column-right"><div style="width: 125px">&nbsp;</div></th></tr></thead><tbody>', n.forEach((function(e, t, a) {
                    var s = "";
                    e.pm_data.asin && "" != e.pm_data.asin && (s = "https://www.amazon" + e.pm_data.marketplace_extension + "/dp/" + e.pm_data.asin);
                    var i = ["DRAFT", "PUBLISHED", "PROPAGATED", "AMAZON_REJECTED"].indexOf(e.status) > -1,
                        r = ["DRAFT", "PUBLISHED", "PROPAGATED", "AMAZON_REJECTED", "DELETED"].indexOf(e.status) > -1,
                        o = !1;
                    new RegExp(["all", "bullets", "description"].join("|")).test(c.search_text_in) && (o = !0);
                    var n = "";
                    e.pm_data && e.pm_data.product_texts && (e.pm_data.product_texts.bullets && e.pm_data.product_texts.bullets.forEach((function(e, t) {
                        e && (n += '<div class="sub-text product-texts ' + (o ? "" : "text-no-wrap") + '" title="Bullet ' + (t + 1) + '"><i class="fa fa-circle" style="font-size: 7px; top: 4px"></i>' + e + "</div>")
                    })), e.pm_data.product_texts.description && "" != e.pm_data.product_texts.description && (n += '<div class="sub-text product-texts ' + (o ? "" : "text-no-wrap") + '" title="Description"><i class="fa fa-bars"></i>' + e.pm_data.product_texts.description + "</div>"));
                    var u = 0,
                        v = !1,
                        f = 0,
                        h = 0,
                        g = "";
                    if (e.pm_data && e.pm_data.sales && e.pm_data.sales.has_sales && "true" == e.pm_data.sales.has_sales) {
                        if (v = !0, u = 999, e.pm_data.sales.total_net_sold && e.pm_data.sales.total_net_sold > 0 && (f = e.pm_data.sales.total_net_sold), e.pm_data.sales.total_royalties && e.pm_data.sales.total_royalties > 0 && (h = e.pm_data.sales.total_royalties), e.pm_data.sales.date_of_last_sale && "0" != e.pm_data.sales.date_of_last_sale) {
                            var b = e.pm_data.sales.date_of_last_sale.split("-");
                            g = b[1] + "/" + b[2] + "/" + b[0]
                        }
                    } else if (e.estimatedExpirationDate && -1 == e.estimatedExpirationDate) u = 999;
                    else {
                        var _ = 1e3 * e.estimatedExpirationDate - l;
                        u = Math.floor(_ / 1e3 / 60 / 60 / 24)
                    }
                    var y = 0,
                        x = 0,
                        w = 0,
                        k = s + "#customerReviews";
                    e.pm_data.reviews && e.pm_data.reviews.num_of_reviews > 0 && (y = e.pm_data.reviews.num_of_reviews && parseInt(e.pm_data.reviews.num_of_reviews) > 0 ? parseInt(e.pm_data.reviews.num_of_reviews) : 0, (x = e.pm_data.reviews.review_score && parseInt(e.pm_data.reviews.review_score) > 0 ? parseFloat(e.pm_data.reviews.review_score).toFixed(1) : 0) > 0 && (w = x / 5 * 100));
                    var $ = !1,
                        C = !1;
                    e.pm_data.bsr && e.pm_data.bsr.bsr_val_clean > 0 && ($ = !0, e.pm_data.bsr.bsr_category && "" != e.pm_data.bsr.bsr_category && (C = !0)), p = '<tr data-merchandiseid="" data-asin="' + e.pm_data.asin + '" data-listing-Id="' + e.listingId + '" data-identifier ="' + e.listingId + '" data-keywords="' + findKeywordsFromTitle(e.productTitle) + '" data-productType="' + e.pm_data.product_type.replace(/\s+/g, "_").toLowerCase() + '"data-marketplace="' + e.pm_data.marketplace_country_code + '" data-status="' + e.status.toLowerCase() + '" data-is_deletable="' + r + '" class="pm-product-container-with-img"><td class="pm-product-row-img-cell text-center freeze-column-left" style="padding: 3px; "><div class="clearfix" style="width: 110px;"><div class="pm-checkbox" style="width: 30px; padding-top: 25px; float: left;"><input type="checkbox" class="magic-checkbox select-row" id="manage-products-table_' + e.listingId + '"/><label style="position:relative" class="" for="manage-products-table_' + e.listingId + '"></label></div><div style="float: left;"><div class="pm-product-row-img-container"><img class="pm-product-row-img pm-load-product-img hide-in-screenshot ' + m + '" src="" data-toggle="popover" data-boundary="viewport" data-content="" data-html="true" data-trigger="hover" data-placement="top"></div></div></div></td><td class="" style=""><div style="width: 370px"><div class="hide-in-screenshot ' + m + '">' + ("live" == e.pm_data.status.toLowerCase() || "auto uploaded" == e.pm_data.status.toLowerCase() || "under review" == e.pm_data.status.toLowerCase() || "processing" == e.pm_data.status.toLowerCase() ? '<a href="' + s + '" target="_blank">' + (e.productTitle ? e.productTitle : "Not set") + "</a>" : e.productTitle ? e.productTitle : "Not set") + '</div><div class="sub-text product-brand hide-in-screenshot ' + m + '" title="Brand">' + (e.brandName ? e.brandName : "Not set") + "</div>" + (e.pm_data.asin_with_markup && "" != e.pm_data.asin_with_markup ? '<div class="sub-text hide-in-screenshot ' + m + '" title="ASIN"><i class="fa fa-qrcode"></i>' + e.pm_data.asin_with_markup + "</div>" : "") + ("" != n ? '<div class="hide-in-screenshot ' + m + '">' + n + "</div>" : "") + '</div></td><td class="" style=""><div style="width: 100px">' + e.pm_data.product_type.replace(/-/gi, "&#8209;") + '</div></td><td class="status" style=""><div style="width: 95px"><div>' + e.pm_data.status + "</div>" + ("live" != e.pm_data.status.toLowerCase() && e.pm_data.delete_reason ? '<div class="sub-text">' + e.pm_data.delete_reason + "</div>" : "") + '</div></td><td class="" style=""><div style="width: 108px">' + (e.updatedDate ? moment(1e3 * e.updatedDate).format("MM/DD/YYYY") : "") + '</div></td><td class="" style=""><div style="width: 108px">' + (e.createdDate ? moment(1e3 * e.createdDate).format("MM/DD/YYYY") : "") + '</div></td><td class="text-center" style=""><div style="width: 80px"><div class="main-text" style="font-weight: 600">' + e.pm_data.currency_symbol + e.listPrice.toFixed(2) + '</div></div></td><td class="" style=""><div style="width: 110px">' + ("removed" != e.pm_data.status.toLowerCase() && "draft" != e.pm_data.status.toLowerCase() ? v ? '<i class="fa fa-money table-icon has-sales-icon green-icon" data-toggle="tooltip" title="Has Sold"></i>' + numberWithCommas(f) : '<i class="fa fa-money table-icon grey-icon" data-toggle="tooltip" title="Has Not Sold"></i>' : "") + '</div></td><td class="" style=""><div style="width: 110px">' + (v ? e.pm_data.currency_symbol + numberWithCommas(h.toFixed(2)) : "") + '</div></td><td class="" style=""><div style="width: 108px">' + (v ? g : "") + '</div></td><td class="" style=""><div style="width: 125px"><div class="review-stars ' + (y > 0 ? "has-reviews" : "") + '"><span style="width: ' + w + '%"></span></div>' + (y > 0 ? '<div class="sub-text text-center"><b>' + x + '</b> - <a href="' + k + '" target="_blank" data-toggle="tooltip" title="View Reviews">' + y + " review" + (1 == y ? "" : "s") + "</a></div>" : "") + '</div></td><td class="text-center" style=""><div style="width: 120px">' + ($ ? '<span class="badge badge-pill badge-info bsr-badge">' + e.pm_data.bsr.bsr_val + "</span>" : "") + (C ? '<div class="sub-text text-center" style="margin-top: 4px">' + e.pm_data.bsr.bsr_category.replace(/-/gi, "&#8209;") + "</div>" : "") + '</div></td><td class="" style=""><div style="width: 80px">' + ("removed" != e.pm_data.status.toLowerCase() ? 999 == u ? "" : u > 60 ? '<div style="font-weight: 600; cursor: default" data-toggle="tooltip" data-html="true" title="Pending Removal<br/>in ' + u + ' days"><i class="fa fa-flag table-icon dtr-icon grey-icon"></i>' + u + "</div>" : u < 8 ? '<div style="font-weight: 600; cursor: default" data-toggle="tooltip" data-html="true" title="Pending Removal<br/>' + (u >= 0 ? " in " + u + (1 == u ? "day" : "days") : Math.abs(u) + " days ago") + '"><i class="fa fa-flag table-icon dtr-icon red-icon"></i>' + u + "</div>" : '<div style="cursor: default" data-toggle="tooltip" data-html="true" title="Pending Removal<br/>in ' + u + ' days"><i class="fa fa-flag table-icon dtr-icon orange-icon"></i>' + u + "</div>" : "") + '</div></td><td class="actions freeze-column-right" style=""><div class="clearfix" style="width: 125px;"><img class="table-flag float-left" style="margin-left: 8px" src="' + chrome.extension.getURL("/assets/img/" + e.pm_data.marketplace_flag_img) + '" title="' + e.pm_data.marketplace_country_name + '"><div class="btn btn-light btn-red btn-sm btn-icon float-right ' + (r ? "delete-product" : "disabled") + '" data-toggle="tooltip" data-html="true" title="' + (r ? "Delete" : "Not Deletable") + '" data-identifier="' + e.listingId + '"><i class="fa fa-trash" style=""></i></div><div class="btn btn-light btn-sm btn-icon float-right ' + (i ? "edit-product" : "disabled") + '" style="margin-right: 6px" data-toggle="tooltip" data-html="true" title="' + (i ? "Edit" : "Not Editable") + '" data-identifier="' + e.listingId + '"><i class="fa fa-pencil" style=""></i></div></div></td></tr>', d.push(p)
                })), f = "</tbody> </table> </div>"
            } else v = "", p = '<div style="text-align: center; color: #959595; margin-top: 50px;"><div style="font-size: 18px; line-height: 1.4; margin-bottom: 25px;">There are no results for your selection<br/>Try choosing different filters above</div><div style="font-size: 30px;">¯\\_(ツ)_/¯</div></div>', f = "", d.push(p);
            var h = "",
                g = d.length > o ? o : d.length;
            for (h = v, x = 0; x < g; ++x) h += d[x], ++r;
            if (d.length > o) {
                h += '<tr><td class="table_load_more_line" colspan="7"><div class="table_load_more_line">Load more...</div></td><td class="table_load_more_line" colspan="7"><div class="table_load_more_line">Load more...</div></td></tr>'
            }
            h += f;
            var b = $(".manage-products-table-wrapper table").length,
                _ = $(".manage-products-table-wrapper").scrollLeft();
            initFloatingHeader(".manage-products-table-wrapper table", "destroy"), $(".manage-products-table-wrapper").first().floatingScrollbar(!1), s.find(".manage-products-table").html(h), _ && $(".manage-products-table-wrapper").scrollLeft(_);
            var y = G_PRODUCT_LIST.product_count,
                w = a;
            s.find(".product-count .filtered-products-shown").addClass("hidden"), s.find(".product-count .total-proucts-shown .number").html(y), t && (s.find(".product-count .total-proucts-shown .number").html(w), s.find(".product-count .filtered-products-shown .number").html(y), s.find(".product-count .filtered-products-shown").removeClass("hidden")), showProductImages($(".manage-products-table")), s.find('.manage-products-table [data-toggle="tooltip"]').tooltip(), b > 0 && !i ? initFloatingHeader(".manage-products-table-wrapper table", "show") : (i = !1, setTimeout((function() {
                initFloatingHeader(".manage-products-table-wrapper table", "show")
            }), 450)), setTimeout((function() {
                $(".manage-products-table-wrapper").first().floatingScrollbar(), $(document).find(".manage-products-table-wrapper").scroll((function(e) {
                    0 == $(this).scrollLeft() ? ($(this).find("table").addClass("right-column-shadow"), $(this).find("table").removeClass("left-column-shadow")) : $(this).scrollLeft() == $(this).find("table").width() - $(this).width() ? ($(this).find("table").addClass("left-column-shadow"), $(this).find("table").removeClass("right-column-shadow")) : $(this).find("table").hasClass("left-column-shadow") && $(this).find("table").hasClass("right-column-shadow") || ($(this).find("table").addClass("left-column-shadow"), $(this).find("table").addClass("right-column-shadow"))
                }))
            }), 250)
        }

        function p(e) {
            $(".manage-products-filters-container input[name=manage-products-search-query]").val(""), s.data("search-query", ""), $(".manage-products-filters-row").each((function() {
                var e = $(this),
                    t = e.find(".manage-products-filter").data("filter"),
                    a = "";
                e.find(".manage-products-filter-option").each((function() {
                    $(this).hasClass("is-default-filter") ? ($(this).addClass("selected"), a = $(this).data("value")) : $(this).removeClass("selected")
                })), s.data("filter-" + t, a)
            }));
            var t = $(".manage-products-filters-container input[name=manage-products-price-query]"),
                a = $(".manage-products-filters-container input[name=manage-products-price-query-2]");
            t.attr("placeholder", "Enter Price").val(""), a.closest(".manage-products-price-query-container").addClass("hide");
            var i = $(".manage-products-filters-container input[name=manage-products-sales-query]"),
                l = $(".manage-products-filters-container input[name=manage-products-sales-query-2]");
            i.attr("placeholder", "Units Sold").val(""), l.closest(".manage-products-sales-query-container").addClass("hide"), $(".manage-products-table th.sortable").removeClass("sorted"), s.data("sort-by", "updatedDate"), s.data("sort-order", "desc"), e()
        }

        function m() {
            s.find(".search-progress-container").css("opacity", 1), s.find(".search-progress-inner").css("width", "100%");
            var e = moment().startOf("day").valueOf(),
                t = 864e5,
                a = [];
            a.push({
                action: "sort",
                property: s.data("sort-by"),
                value: s.data("sort-order")
            }), a.push({
                action: "filter",
                property: "marketplace",
                operator: "equals",
                value: s.data("filter-marketplace"),
                filter_count: {
                    id: "marketplace",
                    val: s.data("filter-marketplace")
                }
            }), a.push({
                action: "filter",
                property: "productType",
                operator: "equals",
                value: s.data("filter-product"),
                filter_count: {
                    id: "productType",
                    val: s.data("filter-product")
                }
            }), a.push({
                action: "filter",
                property: "status",
                operator: "equals",
                value: s.data("filter-status"),
                filter_count: {
                    id: "status",
                    val: s.data("filter-status")
                }
            });
            var i, l, r = "all";
            if ("true" == s.data("filter-has_sales") || "false" == s.data("filter-has_sales") ? a.push({
                    action: "filter",
                    property: "pm_data.sales.has_sales",
                    operator: "equals",
                    value: s.data("filter-has_sales"),
                    filter_count: {
                        id: "has_sales",
                        val: s.data("filter-has_sales")
                    }
                }) : ("equals" == s.data("filter-has_sales") ? r = [$(".manage-products-filters-container input[name=manage-products-sales-query]").val(), $(".manage-products-filters-container input[name=manage-products-sales-query]").val(), !0, !0] : "less_than" == s.data("filter-has_sales") ? r = ["0", $(".manage-products-filters-container input[name=manage-products-sales-query]").val(), !1, !1] : "more_than" == s.data("filter-has_sales") ? r = [$(".manage-products-filters-container input[name=manage-products-sales-query]").val(), "Infinity", !1, !1] : "between" == s.data("filter-has_sales") && (r = [$(".manage-products-filters-container input[name=manage-products-sales-query]").val(), $(".manage-products-filters-container input[name=manage-products-sales-query-2]").val(), !0, !0]), a.push({
                    action: "filter",
                    property: "pm_data.sales.total_net_sold",
                    operator: "between",
                    value: r
                })), r = s.data("filter-is_buyable").trim(), "true" == s.data("filter-is_buyable").trim() || "false" == s.data("filter-is_buyable").trim() ? a.push({
                    action: "filter",
                    property: "pm_data.availability.buyable",
                    operator: "equals",
                    value: r,
                    filter_count: {
                        id: "is_buyable",
                        val: r
                    }
                }) : a.push({
                    action: "filter",
                    property: "pm_data.availability.reason",
                    operator: "equals",
                    value: r
                }), r = "all", "all" != s.data("filter-reviews")) {
                var o = s.data("filter-reviews").split(",");
                r = [parseFloat(o[0]), parseFloat(o[1]), "true" == o[2].trim(), "true" == o[3].trim()], !o[4] || "true" != o[4].trim() && "false" != o[4].trim() ? a.push({
                    action: "filter",
                    property: "pm_data.reviews.review_score",
                    operator: "between",
                    value: r
                }) : a.push({
                    action: "filter",
                    property: "pm_data.reviews.review_score",
                    operator: "between",
                    value: r,
                    filter_count: {
                        id: "has_reviews",
                        val: o[4].trim()
                    }
                })
            } else a.push({
                action: "filter",
                property: "pm_data.reviews.review_score",
                operator: "between",
                value: r
            });
            (r = "all", "all" != s.data("filter-bsr")) ? (r = ["Infinity" == (o = s.data("filter-bsr").split(","))[0].trim() ? "Infinity" : parseInt(o[0]), "Infinity" == o[1].trim() ? "Infinity" : parseInt(o[1]), "true" == o[2].trim(), "true" == o[3].trim()], !o[4] || "true" != o[4].trim() && "false" != o[4].trim() ? a.push({
                action: "filter",
                property: "pm_data.bsr.bsr_val_clean",
                operator: "between",
                value: r
            }) : a.push({
                action: "filter",
                property: "pm_data.bsr.bsr_val_clean",
                operator: "between",
                value: r,
                filter_count: {
                    id: "has_bsr",
                    val: o[4].trim()
                }
            })) : a.push({
                action: "filter",
                property: "pm_data.bsr.bsr_val_clean",
                operator: "between",
                value: r
            });
            (r = "all", "all" != s.data("filter-pending_removal")) && (-1 == s.data("filter-pending_removal") && (i = e + 1 * t, r = [l = "-Infinity", i /= 1e3, !1, !1]), 1 == s.data("filter-pending_removal") ? (l = e + 1 * t, i = e + 8 * t, r = [l /= 1e3, i /= 1e3, !0, !0]) : 2 == s.data("filter-pending_removal") ? (l = e + 8 * t, i = e + 30 * t, r = [l /= 1e3, i /= 1e3, !0, !0]) : 3 == s.data("filter-pending_removal") ? (l = e + 30 * t, i = e + 60 * t, r = [l /= 1e3, i /= 1e3, !1, !0]) : 4 == s.data("filter-pending_removal") ? (l = e + 60 * t, i = e + 90 * t, r = [l /= 1e3, i /= 1e3, !1, !0]) : 5 == s.data("filter-pending_removal") && (l = e + 90 * t, i = e + 180 * t, r = [l /= 1e3, i /= 1e3, !1, !0]));
            if (a.push({
                    action: "filter",
                    property: "estimatedExpirationDate",
                    operator: "between",
                    value: r
                }), r = "all", "all" != s.data("filter-price") && ("equals" == s.data("filter-price") ? r = [$(".manage-products-filters-container input[name=manage-products-price-query]").val(), $(".manage-products-filters-container input[name=manage-products-price-query]").val(), !0, !0] : "less_than" == s.data("filter-price") ? r = ["-Infinity", $(".manage-products-filters-container input[name=manage-products-price-query]").val(), !1, !1] : "more_than" == s.data("filter-price") ? r = [$(".manage-products-filters-container input[name=manage-products-price-query]").val(), "Infinity", !1, !1] : "between" == s.data("filter-price") && (r = [$(".manage-products-filters-container input[name=manage-products-price-query]").val(), $(".manage-products-filters-container input[name=manage-products-price-query-2]").val(), !0, !0])), a.push({
                    action: "filter",
                    property: "listPrice",
                    operator: "between",
                    value: r
                }), r = "all", "all" != s.data("filter-published_date")) {
                var d = moment($(".manage-products-filters-container input[name=manage-products-published-date-query]").val(), "MM/DD/YYYY").startOf("day").valueOf();
                d /= 1e3, "equals" == s.data("filter-published_date") ? r = [d, d, !0, !0] : "less_than" == s.data("filter-published_date") ? r = ["-Infinity", d, !1, !1] : "more_than" == s.data("filter-published_date") && (r = [d, "Infinity", !1, !1])
            }
            if (a.push({
                    action: "filter",
                    property: "createdDate",
                    operator: "between",
                    value: r
                }), r = "all", "all" != s.data("filter-date_of_last_sale")) {
                d = moment($(".manage-products-filters-container input[name=manage-products-last-sale-date-query]").val(), "MM/DD/YYYY").format("YYYY-MM-DD");
                "equals" == s.data("filter-date_of_last_sale") ? r = [d, d, !0, !0] : "less_than" == s.data("filter-date_of_last_sale") ? r = ["-Infinity", d, !1, !1] : "more_than" == s.data("filter-date_of_last_sale") && (r = [d, "Infinity", !1, !1])
            }
            a.push({
                action: "filter",
                property: "pm_data.sales.date_of_last_sale",
                operator: "between",
                value: r
            }), a.push({
                action: "search_text",
                property: s.data("filter-search_text_in"),
                operator: "equals",
                value: s.data("search-query").trim().toLowerCase()
            }), chrome.extension.sendMessage({
                filterManageProductsTable: !0,
                filters: a
            }, (function(e) {
                s.find(".search-progress-container").css("opacity", 0), s.find(".search-progress-inner").css("width", "0%"), c(e.results, e.is_filtered, e.filter_results_count)
            }))
        }

        function u() {
            var e, t = 0;
            $("#nav-prettyProducts-tab").hasClass("active") && $(window).off("scroll").on("scroll", (function() {
                if (document.body.getBoundingClientRect().top > t);
                else if ($("#nav-prettyProducts-tab").hasClass("active")) {
                    $(window).scrollTop() + $(window).innerHeight() > $(".manage-products-table-container").offset().top + $(".manage-products-table-container").height() - 300 ? (clearTimeout(e), e = setTimeout((function() {
                        v()
                    }), 80)) : clearTimeout(e)
                }
                t = document.body.getBoundingClientRect().top
            }))
        }

        function v() {
            var e = d.length - r,
                t = e > o ? o : e,
                a = r;
            if (s.find(".manage-products-table table td.table_load_more_line").each((function() {
                    $(this).closest("tr").remove()
                })), e > 0) {
                for (x = 0; x < t; ++x) {
                    s.find(".manage-products-table table tbody").append(d[a + x]);
                    var i = s.find(".manage-products-table table tbody tr").last();
                    $(i).find('[data-toggle="tooltip"]').tooltip(), $("#blur_switch").is(":checked") && $(i).find(".hide-in-screenshot").addClass("blur-contents"), ++r
                }
                if (showProductImages($(".manage-products-table")), e > o) {
                    s.find(".manage-products-table table tbody").append('<tr><td class="table_load_more_line" colspan="7"><div class="table_load_more_line">Load more...</div></td><td class="table_load_more_line" colspan="7"><div class="table_load_more_line">Load more...</div></td></tr>')
                }
            }
        }
        G_PRODUCT_LIST.other_data.product_types.forEach((function(e, t, a) {
            n += '<div class="pm_btn manage-products-filter-option" data-value="' + e.default_name + '">' + e.pretty_name + "</div>"
        })), $(".manage-products-table-container .product-filter-options .manage-products-filters-options-options_column").html(n), c(G_PRODUCT_LIST.products_list), $(document).off("click", ".manage-products-table .product-texts").on("click", ".manage-products-table .product-texts", (function(e) {
            $(this).closest("tr").find(".product-texts").each((function(e) {
                $(this).toggleClass("text-no-wrap")
            }))
        })), $(document).off("click", ".manage-products-table .product-texts").on("click", ".manage-products-table .product-texts", (function(e) {
            $(this).closest("tr").find(".product-texts").each((function(e) {
                $(this).toggleClass("text-no-wrap")
            }))
        })), $(document).off("keyup change", ".manage-products-filters-container input[name=manage-products-search-query]").on("keyup change", ".manage-products-filters-container input[name=manage-products-search-query]", (function(t) {
            var a = $(this),
                i = s,
                l = t.keyCode || t.which;
            if (8 == l || 27 == l || 32 == l || 46 == l || l >= 48 && l <= 57 || l >= 65 && l <= 90 || l >= 96 && l <= 105 || l >= 109 && l <= 111 || l >= 186 && l <= 192 || l >= 219 && l <= 222) {
                a.next("i").addClass("show");
                var r = "";
                27 == l ? a.val(r) : r = a.val().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""), isAsin(r?.toUpperCase()) ? ($(".manage-products-filter[data-filter='search_text_in']").find(".manage-products-filter-option").each((function() {
                    $(this).removeClass("selected")
                })), $(".manage-products-filter[data-filter='search_text_in'] .manage-products-filter-option[data-value='asin']").first().addClass("selected"), s.data("filter-search_text_in", "asin")) : $(".manage-products-filter[data-filter='search_text_in'] .manage-products-filter-option[data-value='asin']").first().hasClass("selected") && ($(".manage-products-filter[data-filter='search_text_in']").find(".manage-products-filter-option").each((function() {
                    $(this).removeClass("selected")
                })), $(".manage-products-filter[data-filter='search_text_in'] .manage-products-filter-option[data-value='title']").first().addClass("selected"), s.data("filter-search_text_in", "title")), clearTimeout(e), e = setTimeout((function() {
                    s.removeClass("auto-refresh-table"), i.data("search-query", r), m(), a.next("i").removeClass("show")
                }), 750)
            }
        })), $(document).off("keyup change", ".manage-products-filters-container .manage-products-price-query-container input").on("keyup change", ".manage-products-filters-container .manage-products-price-query-container input", (function(e) {
            var a = $(this),
                i = s,
                l = e.keyCode || e.which;
            (8 == l || 46 == l || l >= 48 && l <= 57) && (0 == $(".manage-products-filter[data-filter='price']").find(".manage-products-filter-option:not(.is-all-filter).selected").length && ($(".manage-products-filter[data-filter='price'] .manage-products-filter-option[data-value='all']").removeClass("selected"), $(".manage-products-filter[data-filter='price'] .manage-products-filter-option[data-value='less_than']").addClass("selected"), i.data("filter-price", "less_than")), a.next("i").addClass("show"), clearTimeout(t), t = setTimeout((function() {
                s.removeClass("auto-refresh-table"), "" != a.val().trim() && m(), a.next("i").removeClass("show")
            }), 750))
        })), $(document).off("keyup change", ".manage-products-filters-container .manage-products-sales-query-container input").on("keyup change", ".manage-products-filters-container .manage-products-sales-query-container input", (function(e) {
            var t = $(this),
                a = s,
                i = e.keyCode || e.which;
            (8 == i || 46 == i || i >= 48 && i <= 57) && (0 == $(".manage-products-filter[data-filter='has_sales']").find(".manage-products-filter-option:not(.is-all-filter).selected").length && ($(".manage-products-filter[data-filter='has_sales'] .manage-products-filter-option[data-value='all']").removeClass("selected"), $(".manage-products-filter[data-filter='has_sales'] .manage-products-filter-option[data-value='less_than']").addClass("selected"), a.data("filter-price", "less_than")), t.next("i").addClass("show"), clearTimeout(l), l = setTimeout((function() {
                s.removeClass("auto-refresh-table"), "" != t.val().trim() && m(), t.next("i").removeClass("show")
            }), 750))
        })), $(document).off("click", ".manage-products-clear_filters").on("click", ".manage-products-clear_filters", (function(e, t) {
            p((function(e) {
                m()
            }))
        })), $(document).off("click", ".manage-products-filter .manage-products-filter-option").on("click", ".manage-products-filter .manage-products-filter-option", (function(e, t) {
            if ("I" == e.target.tagName) var a = $(e.target).closest(".manage-products-filter-option");
            else a = $(e.target);
            _filter = a.closest(".manage-products-filter"), _container = a.closest(".manage-products-table-container");
            var i, l = _filter.data("filter-style"),
                r = _filter.data("filter"),
                o = [a.data("value")];
            if ("all" == o) {
                if (_filter.find(".manage-products-filter-option").each((function() {
                        $(this).removeClass("selected")
                    })), a.addClass("selected"), "price" == r || "has_sales" == r) {
                    var d = $(".manage-products-filters-container input[name=manage-products-price-query]");
                    $(".manage-products-filters-container input[name=manage-products-price-query-2]").closest(".manage-products-price-query-container").addClass("hide"), d.attr("placeholder", "Enter Price");
                    var n = $(".manage-products-filters-container input[name=manage-products-sales-query]");
                    $(".manage-products-filters-container input[name=manage-products-sales-query-2]").closest(".manage-products-sales-query-container").addClass("hide"), n.attr("placeholder", "Units Sold")
                }
            } else if (_filter.find(".manage-products-filter-option[data-value='all']").each((function() {
                    $(this).removeClass("selected")
                })), "single-select" == l ? (_filter.find(".manage-products-filter-option").each((function() {
                    $(this).removeClass("selected")
                })), a.addClass("selected")) : "multi-select" == l && (a.hasClass("selected") ? a.removeClass("selected") : a.addClass("selected"), 0 == _filter.find(".manage-products-filter-option.selected").length && _filter.find(".manage-products-filter-option[data-value='all']").each((function() {
                    $(this).addClass("selected")
                })), o = [], _filter.find(".manage-products-filter-option.selected").each((function() {
                    o.push($(this).data("value"))
                }))), "price" == r || "has_sales" == r) {
                var c = "",
                    p = "",
                    u = "",
                    v = "",
                    f = "",
                    h = [];
                "price" == r ? (c = $(".manage-products-filters-container input[name=manage-products-price-query]"), u = (p = $(".manage-products-filters-container input[name=manage-products-price-query-2]")).closest(".manage-products-price-query-container"), v = "Enter Price", f = "From Price", h = ["19.99", "13.00", "20.00"]) : (c = $(".manage-products-filters-container input[name=manage-products-sales-query]"), u = (p = $(".manage-products-filters-container input[name=manage-products-sales-query-2]")).closest(".manage-products-sales-query-container"), v = "Units Sold", f = "From Units", h = ["50", "50", "100"]);
                var g = c.val(),
                    b = p.val();
                "between" == $(this).data("value") ? (u.removeClass("hide"), c.attr("placeholder", f), "" == g.trim() && c.val(h[1]), "" == b.trim() && p.val(h[2])) : (u.addClass("hide"), c.attr("placeholder", v), "true" != $(this).data("value").toString() && "false" != $(this).data("value").toString() && "" == g.trim() && c.val(h[0])), "true" != $(this).data("value").toString() && "false" != $(this).data("value").toString() && c.select()
            }
            s.removeClass("auto-refresh-table"), i = o.join(","), _container.data("filter-" + r, i), m()
        })), $(document).off("click", ".manage-products-table th.sortable").on("click", ".manage-products-table th.sortable", (function() {
            var e = $(this),
                t = (e.closest("table"), e.closest(".manage-products-table-container")),
                a = e.data("sort-by"),
                s = e.data("sort-order");
            if (e.hasClass("sorted")) s = "desc" == s ? "asc" : "desc";
            else switch (a) {
                case "title":
                case "productType":
                case "listPrice":
                case "status":
                case "pm_data.bsr.bsr_val_clean":
                    s = "asc";
                    break;
                case "createdDate":
                case "estimatedExpirationDate":
                    s = "desc";
                    break;
                default:
                    s = "desc"
            }
            t.data("sort-by", a), t.data("sort-order", s), m()
        })), $(".manage-products-collapse_filters").on("click", (function() {
            initFloatingHeader(".manage-products-table-wrapper table", "destroy")
        })), $("#collapse_product_filters").on("hidden.bs.collapse", (function() {
            $(".manage-products-collapse_filters").html('<i class="fa fa-chevron-down"></i>More Filters'), initFloatingHeader(".manage-products-table-wrapper table", "show")
        })), $("#collapse_product_filters").on("shown.bs.collapse", (function() {
            $(".manage-products-collapse_filters").html('<i class="fa fa-chevron-up"></i>Less Filters'), initFloatingHeader(".manage-products-table-wrapper table", "show")
        })), $(document).off("click", ".manage-products-table-container .update-products-table").on("click", ".manage-products-table-container .update-products-table", (function(e) {
            var t = !0;
            $(this).hasClass("no-cache") && (t = !1), s.addClass("auto-refresh-table force-refresh-table"), p((function(e) {
                chrome.extension.sendMessage({
                    update_product_list: !0,
                    progress_container: ".manage-products-table-container",
                    useCache: t
                })
            }))
        })), $(document).off("click", ".manage-products-table-container .update-products-meta-data").on("click", ".manage-products-table-container .update-products-meta-data", (function(e) {
            $(this).find("i").removeClass().addClass("fa fa-circle-o-notch fa-spin"), s.addClass("auto-refresh-table force-refresh-table"), chrome.extension.sendMessage({
                update_product_meta_data: !0
            })
        })), $(document).off("click", "#nav-prettyProducts-tab").on("click", "#nav-prettyProducts-tab", (function(e) {
            u()
        })), u(), $(document).off("click", ".manage-products-table-container .manage-products-table div.table_load_more_line").on("click", ".manage-products-table-container .manage-products-table div.table_load_more_line", (function(e) {
            v()
        })), a.find('[data-toggle="tooltip"]').tooltip(), $(".manage-products-filters-container input[name=manage-products-published-date-query]").caleran({
            singleDate: !0,
            format: "MM/DD/YYYY",
            minDate: moment("2015-09-01"),
            maxDate: moment(),
            showHeader: !1,
            showFooter: !1,
            startOnMonday: !0,
            calendarCount: 1,
            oneCalendarWidth: 248,
            autoCloseOnSelect: !0,
            onafterselect: function(e, t, a) {
                var i, l = s;
                0 == $(".manage-products-filter[data-filter='published_date']").find(".manage-products-filter-option:not(.is-all-filter).selected").length && ($(".manage-products-filter[data-filter='published_date'] .manage-products-filter-option[data-value='all']").removeClass("selected"), $(".manage-products-filter[data-filter='published_date'] .manage-products-filter-option[data-value='less_than']").addClass("selected"), l.data("filter-published_date", "less_than")), $(".manage-products-filters-container input[name=manage-products-published-date-query]").next("i").addClass("show"), clearTimeout(i), i = setTimeout((function() {
                    s.removeClass("auto-refresh-table"), m(), $(".manage-products-filters-container input[name=manage-products-published-date-query]").next("i").removeClass("show")
                }), 750)
            }
        }), $(".manage-products-filters-container input[name=manage-products-last-sale-date-query]").caleran({
            singleDate: !0,
            format: "MM/DD/YYYY",
            minDate: moment("2015-09-01"),
            maxDate: moment(),
            showHeader: !1,
            showFooter: !1,
            startOnMonday: !0,
            calendarCount: 1,
            oneCalendarWidth: 248,
            autoCloseOnSelect: !0,
            onafterselect: function(e, t, a) {
                var i, l = s;
                0 == $(".manage-products-filter[data-filter='date_of_last_sale']").find(".manage-products-filter-option:not(.is-all-filter).selected").length && ($(".manage-products-filter[data-filter='date_of_last_sale'] .manage-products-filter-option[data-value='all']").removeClass("selected"), $(".manage-products-filter[data-filter='date_of_last_sale'] .manage-products-filter-option[data-value='more_than']").addClass("selected"), l.data("filter-date_of_last_sale", "more_than")), $(".manage-products-filters-container input[name=manage-products-last-sale-date-query]").next("i").addClass("show"), clearTimeout(i), i = setTimeout((function() {
                    s.removeClass("auto-refresh-table"), m(), $(".manage-products-filters-container input[name=manage-products-last-sale-date-query]").next("i").removeClass("show")
                }), 750)
            }
        })
    }
    s.find(".shirts-list").length > 0 ? (t > 0 || s.hasClass("force-refresh-table")) && (i = !0, s.removeClass("force-refresh-table"), l((function() {
        s.hasClass("auto-refresh-table") ? r() : 0 == s.find(".shirts-list tbody .refresh-table-trigger-row").length && s.find(".shirts-list tbody").prepend('<tr class="refresh-table-trigger-row"><td colspan="14" class="text-center"><span class="pm_clickable_text update-products-table">Products have been updated. Click here to refresh table...</span></td></tr>')
    }))) : l((function() {
        a.length > 0 && r()
    }))
}

function numberWithCommas(e) {
    return e.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

function abbreviateNumber(e, t) {
    if (null === e) return null;
    if (0 === e) return "0";
    t = !t || t < 0 ? 0 : t;
    var a = e.toPrecision(2).split("e"),
        s = 1 === a.length ? 0 : Math.floor(Math.min(a[1].slice(1), 14) / 3),
        i = s < 1 ? e.toFixed(0 + t) : (e / Math.pow(10, 3 * s)).toFixed(1 + t);
    return (i < 0 ? i : Math.abs(i)) + ["", "K", "M", "B", "T"][s]
}

function showLatestAmzMessage(e) {
    $("#amzMessageModal .message").html("<div style='color:#aaaaaa; margin-bottom:5px'>DATE: <b>" + e.date + "</b></div><p>" + e.msg + "</p>"), $("#amzMessageModal .message").append('<a href="https://merch.amazon.com/dashboard?oldDash">View all messages on dashboard</a>'), showModal("#amzMessageModal")
}

function showLatestEarnings(e) {
    for (var t = "", a = {}, s = 0; s < G_MARKETPLACE_ORDER_ID.length; ++s)
        if (e.earnings[G_MARKETPLACE_ORDER_ID[s]]) {
            a = e.earnings[G_MARKETPLACE_ORDER_ID[s]];
            var i = parseFloat(a.netEarnings.value).toFixed(3);
            t += '<div class="marketplace-earnings clearfix"><div class="text-center float-left" style="width: 160px"><img src="' + chrome.extension.getURL("/assets/img/" + a.flag_img) + '" width="110px"></div><div class="float-left" style="width: 100%; padding-left: 180px; margin-left: -160px;"><div style="font-size: 16px; font-weight: 600">' + a.country_name.toUpperCase() + '</div><div style="margin: 5px 0 10px; font-size: 60px; line-height: 1"><span style="font-size: 45px;" class="earnings-currency">' + a.currencySymbol + '</span><span class="earnings-int">' + Math.trunc(i) + '</span><span style="font-size: 40px;" class="earnings-dec">' + (Math.abs(i) % 1).toFixed(3).substring(1, 4) + "</span></div>" + (G_TAX_RATE > 0 ? '<div class="earnings-after-tax-container" style="font-size: 16px; color: #959595"><span class="earnings-currency">' + a.currencySymbol + '</span><span class="earnings-after-tax">' + deductTax(a.earningsBeforeTaxValue) + '</span> AFTER <span class="tax-rate">' + G_TAX_RATE + "</span>% TAX</div>" : "") + "</div></div>"
        } $("#earningsModal .earnings-date").html(e.date), $("#earningsModal .earnings-container").html(t), showModal("#earningsModal")
}

function showTierUpModal(e) {
    $("#tierUpModal .tier_img").attr("src", e.tier_img), $("#tierUpModal .tier_num").html(numberWithCommas(e.old_tier)), $("#tierUpModal .tier_name").html(e.tier_name), showModal("#tierUpModal");
    $("#tierUpModal .tier-up-container");
    var t = $("#tierUpModal .message"),
        a = $("#tierUpModal .big-red-btn"),
        s = ($("#tierUpModal .reset-btn"), $("#tierUpModal .tier-container")),
        i = $("#tierUpModal .tier-number");
    a.off().on("click", (function() {
        t.addClass("out"), s.addClass("in"), setTimeout((function() {
            var t = i;
            $({
                countNum: e.old_tier
            }).animate({
                countNum: e.tier
            }, {
                duration: 1800,
                easing: "linear",
                step: function() {
                    t.text(numberWithCommas(Math.floor(this.countNum)))
                },
                complete: function() {
                    t.text(numberWithCommas(this.countNum)), setTimeout((function() {
                        $("#tierUpModal .monster-container").addClass("show"), $("#tierUpModal .monster").addClass("play"), setTimeout((function() {
                            $("#tierUpModal .tier-up-container .congrats-title").addClass("in"), $("#tierUpModal .tier-container .level").addClass("in"), confetti("confetti-canvas", "start")
                        }), 2e3)
                    }), 1e3)
                }
            })
        }), 1200)
    })), $("#tierUpModal").off("shown.bs.modal").on("shown.bs.modal", (function(e) {})), $("#tierUpModal").off("hide.bs.modal").on("hide.bs.modal", (function(e) {
        confetti("confetti-canvas", "stop")
    }))
}

function showAvailableInProMessage(e) {
    $("#availableInProModal .list").html(""), $("#availableInProModal .feature_img").attr("src", ""), $("#availableInProModal .feature_img").attr("src", chrome.extension.getURL("/assets/img/pm-pro-preview.png")), showModal("#availableInProModal")
}

function applyHeaderStyles() {
    var e = $("#header-links"),
        t = $("#header-links button.btn-lop"),
        a = t.find("i").first(),
        s = $("#header-links button.btn-account-popover"),
        i = $("#footer-container button.btn-lop"),
        l = i.find("i").first();
    e.addClass("pm-header"), a.removeClass().addClass("fa fa-globe"), t.append('<i class="fa fa-chevron-down"></i>'), s.find("i").first().removeClass().addClass("fa fa-chevron-down"), i.append('<i class="fa fa-chevron-down"></i>'), l.removeClass().addClass("fa fa-globe")
}

function init_nav_menu(e) {
    if (e = e || "", document.getElementById("nav-container")) {
        var t = $("#nav-container .navigation"),
            a = $("#nav-container .navigation .dashboard-link"),
            s = $().add('<li _ngcontent-c0="" class="nav-item"><a class="nav-link" _ngcontent-c0="" href="/dashboard">PrettyMerch</a></li>');
        "hidden" == e || ("active" == e ? (a.find("a").first().removeClass("active").prop("href", "/dashboard?oldDash").attr("routerlinkactive", ""), s.insertBefore(a).find("a").first().addClass("active")) : (a.find("a").first().prop("href", "/dashboard?oldDash"), s.insertBefore(a))), t.css("opacity", 1)
    } else setTimeout((function() {
        init_nav_menu(e)
    }), 300)
}

function wait_for_app_container_to_load(e) {
    var t = 0;
    ! function a() {
        document.getElementsByClassName("app-outlet").length > 0 ? "function" == typeof e && e() : 200 * ++t < 3e3 ? setTimeout((function() {
            a()
        }), 200) : window.location.reload(!0)
    }()
}

function wait_for_dash_to_load(e) {
    ! function t() {
        document.getElementById("dashboard-container") ? "function" == typeof e && e() : setTimeout((function() {
            t()
        }), 200)
    }()
}
chrome.runtime.onMessage.addListener((function(e, t, a) {
    if (e.update && ("publishedItemsSummary" == e.update && updatePublishedItemsSummary(e.data), "processingItemsSummary" == e.update && updateProcessingItemsSummary(e.data), "salesSummary" == e.update && updateSalesSummary(e.data), "salesFlag" == e.update && updateSalesFlag(e.marketplace_css, e.sales), "allTimeSalesSummary" == e.update && updateAllTimeSalesSummary(e.data), "createChart" == e.update && createChart(e.data), "updateSalesChart" == e.update && updateSalesChart(e.data), "topSellerSummary" == e.update && updatetopSellerSummary(e.data), "todaysSalesList" == e.update && createDetailedShirtList(e.data, ".todays-shirts-list", "todays-shirts-list"), "showAmzMessage" == e.update && showLatestAmzMessage(e.data), "showLatestEarnings" == e.update && showLatestEarnings(e.data), "showTierUpModal" == e.update && showTierUpModal(e.data), "loggedOut" == e.update && (e.msg && $("#loggedOutMessage_modal .message").addClass("arl-error").html("🚩 " + e.msg), $("#loggedOutMessage_modal").removeClass("hidden")), "productList" == e.update && updateProductList(e.productList, e.numberOfChanges)), e.toggleLoaderDiv && toggleLoaderDiv(e.container, e.action), e.toggleProgressBar && toggleProgressBar(e.container, e.action, e.title), e.updateProgressBar) {
        var s = e.title || !1;
        updateProgressBar(e.container, e.percentComplete, s)
    }
    e.updateDbProgressBar && updateDbProgressBar(e.progress_data), e.authentication && showDashContents(e), e.attempt_auto_login && autoReLogin(e.email, e.password), e.edit_tab_opened && removeLoadingFromEditLink(e.product_identifier, !0), e.edit_product_not_found && removeLoadingFromEditLink(e.product_identifier, !1, e.message), e.update_deleted_product && updateDeletedProduct(e.product_identifier), e.toggleEditButtons && toggleEditLink(e.action), e.show_in_content_log, e.showImageFromEncodedBlob && showImageFromEncodedBlob(e.encodedBlob, e.resultContainer), e.reloadTabs && window.location.reload(!0)
})), $(document).ready((function() {
    var e = chrome.runtime.getManifest(),
        t = window.location.href; - 1 != window.location.pathname.indexOf("signin") && -1 != window.location.search.indexOf("merch.amazon.com") ? $("#signInSubmit").click((function() {
        var e = "tmp";
        document.getElementById("ap_email") ? e = btoa(document.getElementById("ap_email").value) : document.getElementById("ap-claim") && (e = btoa(document.getElementById("ap-claim").value)), chrome.extension.sendMessage({
            user_logged_in: "true",
            s_id: e
        })
    })) : -1 != window.location.pathname.indexOf("/dashboard") && -1 == window.location.search.indexOf("oldDash") ? wait_for_app_container_to_load((function() {
        wait_for_dash_to_load((function() {
            applyHeaderStyles(), init_nav_menu("active");
            for (var t = 0; t < document.styleSheets.length; t++) {
                var a = document.styleSheets[t];
                a.href && a.href.indexOf("amazon.com") && (a.disabled = !0)
            }
            $(".app-outlet").after($().add('<div id="prettydash-wrapper" style="position:relative"><div id="prettydash-container" class="container"></div></div>'));
            var s = moment().startOf("day").valueOf(),
                i = 0,
                l = 0;
            chrome.extension.sendMessage({
                get_logged_in_user_and_marketplace: !0
            }, (function(t) {
                logged_in_user = t.logged_in_user, selected_marketplace = t.selected_marketplace, i = t.last_db_merge_date, l = t.last_products_full_sync;
                var a = logged_in_user + "_options",
                    r = logged_in_user + btoa("_licence");
                chrome.storage.sync.get([a, r, "welcomeMessage", "updateAvailableMessage", "updateMessage", "specialOffers"], (function(t) {
                    if (void 0 !== t[a] && "" != t[a] && t[a].tax_rate && (G_TAX_RATE = t[a].tax_rate), void 0 !== t[r] && "" != t[r]) {
                        var o = atob(t[r].ul),
                            d = atob(t[r].iv);
                        G_PRO_PLAN = t[r].hasOwnProperty("pl") ? atob(t[r].pl) : "free";
                        var n = !!t[r].cd && atob(t[r].cd),
                            c = !!t[r].fd && atob(t[r].fd),
                            p = atob(t[r].lm);
                        G_IS_PRO = !("true" !== d || !G_PRO_PLAN.includes("pro")), G_LICENCE = o, G_LICENCE_CANCELLED_AT = "false" !== n && n, G_LICENCE_FAILED_AT = "false" !== c && c, G_LICENCE_MSG = p
                    } else G_IS_PRO = !1, G_PRO_PLAN = "free", G_LICENCE = !1;
                    var m = G_IS_PRO ? '<div class="badge badge-primary pro-badge" style="background-color: #f96e5f; font-size: 12px; position: absolute; top: 4px; right: -38px; height: 18px;">PRO</div>' : "",
                        u = '<div id="loggedOutMessage_modal" class="pm-logged-out-message-container hidden"><img src="' + chrome.extension.getURL("/assets/img/pretty-logo-logged-out.png") + '"><div class="title">You\'ve been signed out</div><div class="message"><p>Heads up! It looks like you\'ve been signed out of your Merch by Amazon account.</p><p>Sign in to continue getting realtime updates on your sales</p></div><div class="footer text-right"><a href="https://merch.amazon.com/dashboard" class="btn btn-primary" style="margin-right: 6px">Go to sign-in page</a><button type="button" class="btn btn-light close_loggedOutMessage_modal">Close</a></div></div>',
                        v = '<div class="modal fade" id="licenceModal" tabindex="-1"><div class="modal-dialog modal-lg modal-dialog-centered"><div class="modal-content"><div class="modal-header"><span class="modal-title" style="margin-left:20px"><i class="fa fa-unlock-alt" style="margin-right:6px"></i>Upgrade to PrettyMerch PRO</span><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button></div><div class="modal-body clearfix" style="padding: 30px 20px 35px"><div class="float-left" style="width: 55%; padding: 20px 25px 5px 25px; border: 1px solid #e1e1e1; border-radius: 14px; background-color: #fafafa;"><div style="font-weight: 600; margin-bottom: 20px">➡  I <b>have</b> a PrettyMerch PRO subscription</div><form id="enterLicenceForm" class="clearfix" style="margin: 5px 0 30px 0; padding: 15px 15px 18px; border: 1px solid #9acff4; border-radius: 8px; background-color: #f4fbff;"><fieldset><div class="form-group" style="position: relative; margin-bottom: 20px;"><span class="form-control-label" for="licenceKey">Enter your Licence Key or Email</span><input type="text" class="form-control form-control-lg licenceKey" style="padding: 8px 8px; font-weight: bold;" spellcheck="false" data-lpignore="true"><div class="invalid-feedback" style="position: absolute;">Invalid licence key</div></div></fieldset><div type="button" class="btn btn-primary float-right saveLicence">Save Licence</div></form><div style="font-size:14px"><p><b>How do I unlock the PRO features?</b><br/>Please enter your Licence Key or Email above and click <b>Save Licence</b>. PrettyMerch will automatically reload and enable all the PRO features.</p><p><b>Where can I find my Licence or Email?</b><br/>If you signed up through <b>Gumroad</b>, you should enter the Licence key provided by Gumroad. If you signed up through the <b>PrettyMerch</b> website, you should enter the email you used while signing up. In both cases you will have received an email with your subscription details.</p></div></div><div class="float-left" style="width: 45%; padding: 20px 25px 5px 25px"><div style="font-weight: 600; margin-bottom: 20px">➡  I <b>don\'t</b> have a PrettyMerch PRO subscription</div><div style="font-size:14px"><p>Upgrade to PrettyMerch PRO or PRO+ and unlock even more awesome features to help you reach your full potential in Merch by Amazon.</p><div style=""><b>How do I upgrade?</b><br/><div style="padding: 10px 0 0 15px"><b>1.</b> <a href="https://bit.ly/pretty-subscribe" target="_blank" title="Go to prettymerch.com">Visit our website (www.prettymerch.com)</a><br/><b>2.</b> Select your plan and subscribe<br/><b>3.</b> Come back to this page and enter your email to unlock the Pro features<br/></div><a href="https://bit.ly/pretty-subscribe" target="_blank" class="btn btn-success" style="margin-top: 25px; padding: 6px 30px;">Upgrade PrettyMerch Now</a></div></div></div><div style="width: 155px; position: absolute; bottom: 35px; right: 25px;"><img src="' + chrome.extension.getURL("/assets/img/upgrade-monster.png") + '" style="width: 100%;"/></div></div></div></div></div>',
                        f = '<div id="freeTrialMessage" class="row hidden"><div class="col-12"><div class="alert alert-info clearfix" style="background-color: #eff6ff; border: none; border-radius: 12px;"><div class="float-left" style="width: 60px"><img src="' + chrome.extension.getURL("/assets/img/gift.png") + '" style="width: 45px; height: auto; margin-top: 5px"></div><div class="float-left" style="width: 100%; padding: 0 200px 0 60px; margin: 0 -200px 0 -60px;"><div class="message mb-0">Congratulations!<br/>You\'re enjoying a limited time, <b>free preview</b> of <a href="https://bit.ly/pretty-subscribe" target="_blank"><b>PrettyMerch Pro+</b></a> until December 6th.<br/>Feel free to explore all our premium features and the brand new Research tool.</div></div><div class="float-left text-center" style="width: 200px; padding-left: 20px; border-left: 1px dotted #3597ce"><a href="https://bit.ly/pretty-subscribe" target="_blank" class="btn btn-sm btn-primary" style="width: 100%; margin-top: 6px">Upgrade to Pro+ Now</a></div></div></div></div>',
                        h = '<div id="welcomeMessage" class="row hidden"><div class="col-12"><div class="alert alert-primary clearfix" style="background-color: #e2effd;"><div class="float-left" style="width: 60px"><img src="' + chrome.extension.getURL("/assets/img/announcement.png") + '" style="width: 45px; height: auto; margin-top: 5px"></div><div class="float-left" style="width: 100%; padding-left: 60px; margin-left: -60px;"><div class="title"></div><div class="message"></div><button type="button" class="btn btn-sm btn-primary clear-welcome-message" data-dismiss="alert" style="margin-top:20px">Got it, close this</button></div></div></div></div>',
                        g = '<div id="updatesAlert" class="row hidden"><div class="col-12" style="background: #f5f5f5; padding: 15px; border-radius: 20px; margin-bottom: 30px;"><i class="fa fa-times-circle pm-close-icon clear-update" style="font-size: 26px"></i><div class="updatesContainer alert alert-primary clearfix" style="background-color: #e2effd; border-radius: 20px; margin: 0"><div class="float-left" style="width: 60px"><img src="' + chrome.extension.getURL("/assets/img/announcement.png") + '" style="width: 45px; height: auto; margin-top: 5px"></div><div class="float-left" style="width: 100%; padding-left: 60px; margin-left: -60px;"><div class="title"></div><div class="message"></div><div class="list"></div></div></div><div class="upgradeToProContainer alert alert-warning clearfix hidden" style="border-color: #f9d795; background-color: #fff8e0; border-width: 2px; border-radius: 20px; margin: 20px 0 0 0"><div class="float-left" style="width: 60px"><img src="' + chrome.extension.getURL("/assets/img/announcement.png") + '" style="width: 45px; height: auto; margin-top: 5px"></div><div class="float-left" style="width: 100%; padding-left: 60px; margin-left: -60px;"><a href="https://bit.ly/pretty-subscribe" target="_blank"><img src="' + chrome.extension.getURL("/assets/img/60-off-corona.jpg") + '" style="width: 400px; height: 285px; float: right; border-radius: 8px; margin-left: 20px; margin-right: -8px;"></a><div class="title">Upgrade to PrettyMerch PRO - <b>60% OFF Limited Time Offer</b></div><div class="message">If you enjoyed using PrettyMerch Pro, then this is an offer you won\'t want to miss. Subscribe today and get a <b>$72 discount on your yearly subscription</b>. That\'s 60% OFF for life.</div><div class="list"><ul style="color: #856404; margin-bottom: 16px;"><li style="margin-bottom: 5px">Don\'t lose access to these amazing features:</li><li style="margin-bottom: 5px">✔ View detailed analytics for ANY time period</li><li style="margin-bottom: 5px">✔ Stay logged in all day using Auto Re-Login</li><li style="margin-bottom: 5px">✔ Click on the charts to view sales and analytics</li><li style="margin-bottom: 5px">✔ Manage unlimited products in the Products Manager</li><li style="">🚨 <b>Offer Ends TODAY</b></li></ul><p><b><a href="https://bit.ly/pretty-subscribe" target="_blank">Click here to Upgrade to Pro for only $9.99 (monthly) or $48 (yearly)</a></b></p></div></div></div><button type="button" class="btn btn-sm btn-primary clear-update" style="margin: 0 auto; display: block; margin-top: 20px; padding: 6px 16px;">Got it, close this</button></div></div>';
                    var b = '<div class="modal fade" id="updateProgressModal" tabindex="-1"><div class="modal-dialog modal-dialog-centered"><div class="modal-content"><div class="modal-body text-center clearfix"><img src="' + chrome.extension.getURL("/assets/img/pretty-logo.png") + '" width="75px" height="75px" class="" style="margin-bottom: 10px;"><p class="h5" style="margin-bottom:10px;">Updating PrettyMerch</p><div class="progress" style="margin-bottom: 5px"><div class="progress-bar" role="progressbar" style="width: 0%; height: 25px; background-color:#5facff;"></div></div><div class="progress-text">This will only take a few seconds</div><a href="https://merch.amazon.com/dashboard" class="btn btn-primary reload-page fade" style="margin: 0 auto; margin-top: 25px">Reload Page</a></div></div></div></div>',
                        _ = '<div class="modal fade" id="availableInProModal" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="modal-body text-center clearfix" style=""><div style="font-size: 20px; line-height: 40px; margin-bottom: 20px"><img src="' + chrome.extension.getURL("/assets/img/pretty-logo.png") + '" width="40px" height="40px" style="margin-right: 8px; "><span style="color:#f55d4c; margin-right:1px">Pretty</span><span style="color:#757575">Merch</span><span class="badge badge-primary" style="background-color: #f96e5f; margin-left: 6px; font-size: 12px; position: relative; top: -3px;">PRO</span></div><div class="" style="margin-bottom: 20px; font-size: 18px; line-height: 24px; color: #656565;">Upgrade to PrettyMerch PRO to unlock<br/>these awesome features</div><a style="display: block; margin-bottom: 25px" href="https://www.prettymerch.com" target="_blank" title="Learn more about PrettyMerch Pro"><img class="feature_img" style="width: 450px; border: 1px solid #e1e1e1; border-radius: 8px; box-shadow: 4px 4px 8px rgba(1, 1, 1, 0.1);" src="" /></a><a href="https://bit.ly/pretty-subscribe" target="_blank" class="btn btn-success mr-2">Upgrade to PrettyMerch Pro</a><a href="https://www.prettymerch.com" target="_blank" class="btn btn-light">Learn More</a></div><div class="modal-footer clearfix"><button type="button" class="btn btn-light" data-dismiss="modal">Close</button></div></div></div></div>',
                        y = '<div class="modal fade" id="amzMessageModal" tabindex="-1"><div class="modal-dialog modal-dialog-centered"><div class="modal-content"><div class="modal-header"><span class="modal-title">New message from Merch by Amazon</span><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span></button></div><div class="modal-body clearfix" style=""><div style="text-align:center; margin-bottom:10px"><img src="' + chrome.extension.getURL("/assets/img/envelope.png") + '" width="" height="100px" style=""></div><div class="message" style="margin-bottom: 15px; font-size: 16px; line-height: 20px;"></div></div><div class="modal-footer clearfix" style="display: block"><div class="float-left" style="position: relative; margin-top: 6px;"><img src="' + chrome.extension.getURL("/assets/img/pretty-logo.png") + '" width="18px" height="18px" style="margin-right: 5px;"><span style="color:#f55d4c; margin-right:1px">Pretty</span><span style="color:#757575">Merch</span>' + m + '</div><button type="button" class="btn btn-sm btn-light float-right" data-dismiss="modal">Close</button></div></div></div></div>',
                        w = '<div class="modal fade" id="earningsModal" tabindex="-1"><div class="modal-dialog modal-dialog-centered"><div class="modal-content"><div class="modal-header"><span class="modal-title">Earnings have been posted for <span class="earnings-date"></span></span><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span></button></div><div class="modal-body clearfix"><div class="earnings-container clearfix"></div></div><div class="modal-footer clearfix" style="display:block"><div class="float-left" style="position: relative; margin-top: 6px;"><img src="' + chrome.extension.getURL("/assets/img/pretty-logo.png") + '" width="18px" height="18px" style="margin-right: 5px;"><span style="color:#f55d4c; margin-right:1px">Pretty</span><span style="color:#757575">Merch</span>' + m + '</div><button type="button" class="btn btn-sm btn-light float-right" data-dismiss="modal">Close</button></div></div></div></div>',
                        k = '<div class="modal fade" id="tierUpModal" tabindex="-1"><div class="modal-dialog modal-dialog-centered"><div class="modal-content"><div class="modal-body text-center clearfix"><canvas id="confetti-canvas" ></canvas><div class="tier-up-container"><div class="congrats-title"><span>Congratulations</span> 🎉</div><div class="message"><div class="title">A new Tier<br/>is waiting for you!</div><div class="click-to-reveal"><img class="big-red-btn" src="' + chrome.extension.getURL("/assets/img/big-red-button.png") + '" alt="Click to reveal new tier"></div><div class="subtitle">Click to reveal your new tier</div></div><div class="tier-container"><div class="tier-number tier_num">0</div><div class="level">Merch Level: <span class="tier_name">Total Charisma</span></div></div><div class="monster-container"><div class="monster"><div class="circle"></div><div class="image"><div><img class="tier_img" src="" /></div><div><img class="tier_img" src="" /></div></div></div></div></div></div><div class="modal-footer clearfix" style="display:block"><div class="float-left" style="position: relative; margin-top: 6px;"><img src="' + chrome.extension.getURL("/assets/img/pretty-logo.png") + '" width="18px" height="18px" style="margin-right: 5px;"><span style="color:#f55d4c; margin-right:1px">Pretty</span><span style="color:#757575">Merch</span>' + m + '</div><button type="button" class="btn btn-sm btn-light float-right close-tier-up-modal" data-dismiss="modal">Close</button></div></div></div></div>',
                        C = '<div class="modal fade lazy-load-images-container" id="salesModal" tabindex="-1"><div class="modal-dialog modal-lg"><div class="modal-content"><div class="modal-header"><span class="modal-title">Sales:</span><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button></div><div class="modal-body clearfix" style="min-height: 300px;"><div class="row chart-summary-container" style=""><div class="col"><div class="row"><div class="col"><div class="clearfix" style="margin-bottom:30px;"><div class="chart-summary blue-container"><div class="chart-summary-title">Sales</div><div class="chart-summary-number"><span class="sales">0</span></div><div class="chart-summary-footer sold-cancelled" title="Sold - Cancelled">0 - 0</div></div><div class="chart-summary orange-container"><div class="chart-summary-title">Returns</div><div class="chart-summary-number returned">0</div></div><div class="chart-summary pink-container"><div class="chart-summary-title">Royalties</div><div class="chart-summary-number royalties"><span class="currency-symbol">$</span><span class="number">0</span><span class="decimal"></span></div><div class="chart-summary-footer" title="Total Revenue"><span class="currency-symbol">$</span><span class="revenue">0</span></div></div><div class="chart-summary" style=""><div class="chart-summary-title">Royalties/Sale</div><div class="chart-summary-number royalties-per-sale"><span class="currency-symbol">$</span><span class="number">0</span><span class="decimal"></span></div></div><div class="chart-summary" style="float:right; margin-right:0; display:none"><div class="chart-summary-title text-center">Avg. Per Day</div><div class="chart-summary-number clearfix"><div class="" style="float: left; box-sizing: border-box; text-align: center; width: 120px;"><span class="your-share">0</span></div><div class="" style="float: left; box-sizing: border-box; text-align: center; width: 120px"><span class="amazons-share">0</span></div></div><div class="chart-summary-footer clearfix"><div class="" style="float: left; box-sizing: border-box; text-align: center; width: 120px;">Sales</div><div class="" style="float: left; box-sizing: border-box; text-align: center; width: 120px">Royalties</div></div></div></div></div></div><div class="row"><div class="col" style=""><div class="stats-progress-col clearfix" style="padding-right: 6px"><div class="chart-summary-title">Top Products</div><div class="top-products"></div></div></div><div class="col" style=""><div class="stats-progress-col clearfix" style="padding: 0 3px"><div class="chart-summary-title">Top Fit Types</div><div class="top-fit-types"></div></div></div><div class="col"><div class="stats-progress-col clearfix" style="padding-left: 6px"><div class="chart-summary-title">Top Colors</div><div class="top-colors"></div></div></div></div></div></div><div class="shirt-list" style="min-height:100px"></div></div><div class="modal-footer clearfix" style="display:block"><div class="float-left" style="position: relative; margin-top: 6px;"><img src="' + chrome.extension.getURL("/assets/img/pretty-logo.png") + '" width="18px" height="18px" style="margin-right: 5px;"><span style="color:#f55d4c; margin-right:1px">Pretty</span><span style="color:#757575">Merch</span>' + m + '</div><button type="button" class="btn btn-sm btn-light float-right" data-dismiss="modal">Close</button></div></div></div></div>',
                        M = '<div class="modal fade" id="optionsModal" tabindex="-1"><div class="modal-dialog modal-dialog-centered"><div class="modal-content"><div class="modal-header"><span class="modal-title">PrettyMerch Options</span><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span></button></div><div class="modal-body options-form clearfix" style=""><div class="form-group" style="margin-bottom:25px"><label class="form-control-label">New Sales Notification</label><div class="form-check"><label class="form-check-label"><input class="form-check-input" type="checkbox" id="salesNotif">Show a notification when I make a sale</label></div><div class="saleSound-options" style="padding-left:20px; margin-top: 3px"><div class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="saleSound" value="coin-1"><span class="play_sound" title="Play sound"><i class="fa fa-play"></i></span> 8-bit Super Mario Coin</label></div><div class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="saleSound" value="sonic-1"><span class="play_sound" title="Play sound"><i class="fa fa-play"></i></span> 8-bit Sonic the Hedgehog Ring</label></div><div class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="saleSound" value="cha-ching-1"><span class="play_sound" title="Play sound"><i class="fa fa-play"></i></span> Cha-Ching!</label></div><div class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="saleSound" value="no_sound">No sound</label></div></div></div><div class="form-group" style="margin-bottom:25px"><label class="form-control-label">Logged Out Notification</label><div class="form-check"><label class="form-check-label"><input class="form-check-input" type="checkbox" id="logoutNotif">Show a notification when I\'m logged out of Merch</label></div><div class="logoutSound-options" style="padding-left:20px; margin-top: 3px"><div class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="logoutSound" value="attention-5"><span class="play_sound" title="Play sound"><i class="fa fa-play"></i></span> Attention - Classic</label></div><div class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="logoutSound" value="attention-6"><span class="play_sound" title="Play sound"><i class="fa fa-play"></i></span> Attention - Subtle</label></div><div class="form-check"><label class="form-check-label"><input class="form-check-input" type="radio" name="logoutSound" value="no_sound">No sound</label></div></div></div><div class="form-group" style="margin-bottom:25px"><label class="form-control-label">Tax Deductions<small class="form-text text-muted">The selected tax rate will be deducted from all royalties</small></label><div class="form-row" style="padding-left: 20px"><label for="input_taxRate" class="col-2 col-form-label">Tax Rate</label><div class="col-10"><div class="input-group"><input type="text" class="form-control text-center col-3" id="input_taxRate" data-lpignore="true"><div class="input-group-append"><span class="input-group-text" id="">%</span></div><div class="invalid-feedback">Please enter a number between 0 and 100</div></div></div></div></div><div class="divider-title"><div><span class="badge badge-primary pro-badge" style="background-color: #f96e5f; margin-right: 4px; font-size: 12px; position: relative; top: -2px;">PRO</span>OPTIONS</div></div><div class="pro-options">' + (G_IS_PRO ? "" : '<div class="alert alert-primary text-center" style="font-size: 14px"><a href="https://bit.ly/pretty-subscribe" target="_blank" class="alert-link">Upgrade to PrettyMerch Pro</a> to unlock these awesome options</div>') + '<div class="form-group"><label class="form-control-label">Auto Re-Login<small class="form-text text-muted">PrettyMerch will keep you logged in to your Merch by Amazon account</small></label><div class="form-check"><label class="form-check-label"><input class="form-check-input" type="checkbox" id="allow_autoReLogin">Keep me logged in to my Merch by Amazon account</label></div><div class="autoReLogin-options" style="padding-left: 40px"><div class="form-row" style="margin-top: 8px"><label for="input_arl_email" class="col-2 col-form-label">Email</label><div class="col-10"><input type="email" class="form-control col-10" id="input_arl_email" spellcheck="false" autocomplete="false" data-lpignore="true"><div class="invalid-feedback">Please enter a valid email</div></div></div><div class="form-row" style="margin-top: 8px"><label for="input_arl_password" class="col-2 col-form-label">Password</label><div class="col-10"><input type="password" class="form-control col-10" id="input_arl_password" spellcheck="false" autocomplete="false" data-lpignore="true"><div class="invalid-feedback">Please enter a valid password</div><small id="emailHelp" class="form-text text-muted"><a href="#" data-toggle="popover" data-placement="top" data-trigger="focus" title="Where are my credentials stored?" data-html="true" data-content="<p>Your email and password are <b>encrypted</b> and stored on <b>YOUR computer</b>.</p><p>They are used to re-log you into your Merch by Amazon account whenever you are logged out.</p><p>Your credentials are NOT transferred to any external services or servers.</p>">Where are my email and password stored?</a></small></div></div></div></div></div></div><div class="modal-footer"><button type="button" class="btn btn-primary" id="saveOptions">Save and Close</button><button type="button" class="btn btn-light" data-dismiss="modal">Cancel</button></div></div></div></div>',
                        P = '<div class="prettydash-footer clearfix"><div class="float-left"><img src="' + chrome.extension.getURL("/assets/img/pretty-logo.png") + '" width="18px" height="18px" style="margin-right: 5px; " class="show-beta"><span style="color:#f55d4c; margin-right:1px">Pretty</span><span style="color:#757575">Merch</span><span class="version" style="margin-left: 8px; color: #959595;">v' + e.version + '</span></div><div class="float-right">' + (G_IS_PRO ? '<a href="" class="enter-licence" style="margin-right: 30px;"><i class="fa fa-pencil"></i> Edit Licence</a>' : '<a href="" class="enter-licence" title="Upgrade to PrettyMerch Pro" style="margin-right: 30px;"><i class="fa fa-unlock"></i> Upgrade to PRO</a>') + '<a href="https://bit.ly/pretty-android" target="_blank" title="Get the PrettyMerch App for Android" style="margin-right: 10px;"><i class="fa fa-android"></i> Android</a><a href="https://bit.ly/pretty-ios" target="_blank" title="Get the PrettyMerch App for iOS" style="margin-right: 30px;"><i class="fa fa-apple"></i> iOS</a><a href="https://bit.ly/pretty-fb-group" target="_blank" title="Join the PrettyMerch Facebook Group" style="margin-right: 10px;"><i class="fa fa-facebook-square"></i> Facebook Group</a><a href="mailto: getprettymerch@gmail.com" title="Drop us a line" style="margin-right: 30px;"><i class="fa fa-envelope-o"></i> getprettymerch@gmail.com</a><a href="" class="trigger-options-modal" style="font-weight: 600"><i class="fa fa-cog"></i> Options</a></div></div>',
                        R = G_IS_PRO ? "pro+" == G_PRO_PLAN ? "pm-logo-ext-pro-plus.png" : "pm-logo-ext-pro.png" : "pm-logo-ext.png",
                        S = {
                            browser_width: window.innerWidth - 17,
                            min_width: 994,
                            max_width: 1600,
                            screen_padding: 100,
                            width: 994,
                            left: 0
                        };
                    S.width = S.browser_width - S.screen_padding, S.width < S.min_width ? S.width = S.min_width : (S.width > S.max_width && (S.width = S.max_width), S.left = -1 * (S.browser_width - S.width) / 2);
                    var T = G_IS_PRO ? "" : '<div class="badge badge-primary pro-badge" style="background-color: #f96e5f; font-size: 8px; position: absolute;">PRO</div>',
                        L = G_IS_PRO ? "" : '<div class="badge badge-primary pro-badge" style="background-color: #f6a21f; font-size: 8px; position: absolute;">PRO+</div>',
                        O = '<div id="prettydash" class="prettydash row" style="padding-top: 20px;"><div class="col-12">' + h + f + '<div id="invalidLicenceMessage" class="row hidden"><div class="col-12"><div class="alert alert-danger clearfix" style=""><div class="message-icon float-left" style="width: 60px"><i class="fa fa-exclamation-circle" style="width: 45px; height: auto; font-size: 45px; color: #dc3545"></i></div><div class="float-left" style="width: 100%; padding-left: 60px; margin-left: -60px;"><div class="title"></div><div class="message"></div><div class="buttons" style="margin-top:20px"><a href="https://bit.ly/pretty-subscribe" target="_blank" class="btn btn-sm btn-primary" style="margin-right: 6px">Renew Your Subscription</a><button type="button" class="btn btn-sm btn-light enter-licence" style="margin-right: 6px">Update Licence Key</button><button type="button" class="btn btn-sm btn-light delete-licence" data-dismiss="alert">Got it, close this</button></div></div></div></div></div><div id="updatesAvailableAlert" class="row hidden"><div class="col-12"><div class="alert alert-warning"><div class="title"></div><div class="message"></div><div style="margin-top:20px"><button type="button" class="btn btn-sm btn-warning update-extension-now" >Update PrettyMerch Now</button><button type="button" class="btn btn-sm btn-link clear-update-available" data-dismiss="alert">Not now, close this</button></div></div></div></div>' + g + '<div id="specialOffersAlertBox" class="row hidden" data-ad_id=""><div class="col-12" style="background: #f5f5f5; padding: 15px; border-radius: 20px; margin-bottom: 30px;"><i class="fa fa-times-circle pm-close-icon clear-special-offer" style="font-size: 26px"></i><div class="specialOfferContainer alert alert-warning clearfix" style="border-color: #f9d795; background-color: #fffaf2; border-width: 2px; border-radius: 20px; margin: 0px 0 0 0"><div class="text-center specialOfferContent" style="width: 100%;"></div></div><button type="button" class="btn btn-sm btn-link clear-special-offer" style="margin: 0 auto; display: block; margin-top: 20px; padding: 6px 16px;">Got it, close this</button></div></div><div class="row" style="margin-bottom: 20px"><div class="col-4"><div class="header"><img src="' + chrome.extension.getURL("/assets/img/" + R) + '" height="40px" style=""></div></div><div class="col-8 clearfix" style="height: 41px; white-space: nowrap; text-align: right; direction: rtl;"><div class="header-flag-container d-inline-block clearfix"><div class="header-flag usa-mrkt ' + ("usa" == selected_marketplace.country_code ? "active" : "") + '" data-marketplace="usa" data-toggle="tooltip" title="View USA sales"><img src="' + chrome.extension.getURL("/assets/img/flag_USA_256_min.png") + '"><div class="sales-number">0</div></div><div class="header-flag uk-mrkt ' + ("uk" == selected_marketplace.country_code ? "active" : "") + '" data-marketplace="uk" data-toggle="tooltip" title="View UK sales"><img src="' + chrome.extension.getURL("/assets/img/flag_UK_256_min.png") + '"><div class="sales-number">0</div></div><div class="header-flag ger-mrkt ' + ("ger" == selected_marketplace.country_code ? "active" : "") + '" data-marketplace="ger" data-toggle="tooltip" title="View Germany sales"><img src="' + chrome.extension.getURL("/assets/img/flag_DE_256_min.png") + '"><div class="sales-number">0</div></div><div class="header-flag fr-mrkt ' + ("fr" == selected_marketplace.country_code ? "active" : "") + '" data-marketplace="fr" data-toggle="tooltip" title="View France sales"><img src="' + chrome.extension.getURL("/assets/img/flag_FR_256_min.png") + '"><div class="sales-number">0</div></div><div class="header-flag it-mrkt ' + ("it" == selected_marketplace.country_code ? "active" : "") + '" data-marketplace="it" data-toggle="tooltip" title="View Italy sales"><img src="' + chrome.extension.getURL("/assets/img/flag_IT_256_min.png") + '"><div class="sales-number">0</div></div><div class="header-flag es-mrkt ' + ("es" == selected_marketplace.country_code ? "active" : "") + '" data-marketplace="es" data-toggle="tooltip" title="View Spain sales"><img src="' + chrome.extension.getURL("/assets/img/flag_ES_256_min.png") + '"><div class="sales-number">0</div></div><div class="header-flag jp-mrkt ' + ("jp" == selected_marketplace.country_code ? "active" : "") + '" data-marketplace="jp" data-toggle="tooltip" title="View Japan sales"><img src="' + chrome.extension.getURL("/assets/img/flag_JP_256_min.png") + '"><div class="sales-number">0</div></div></div><a href="https://merch.amazon.com/designs/new" target="_blank" class="btn btn-success d-inline-block clearfix add-new-product-btn" data-toggle="tooltip" data-placement="top" data-delay="150" title="Add New Product" style="margin: 0 35px 0 25px;"><i class="fa fa-plus" style=""></i></a><div class="header-stats rejected d-inline-block" style="vertical-align: top;" data-toggle="tooltip" data-placement="top" title="Rejected"><div class="number">0</div><div class="title">REJ</div></div><div class="header-stats processing d-inline-block" style="vertical-align: top;" data-toggle="tooltip" data-placement="top" title="Processing"><div class="number">0</div><div class="title">PS</div></div><div class="header-stats auto-review d-inline-block" style="vertical-align: top;" data-toggle="tooltip" data-placement="top" title="Under Review"><div class="number">0</div><div class="title">UR</div></div><div class="header-stats tier d-inline-block clearfix" style="margin-right: 25px;"><div class="tier-text float-left"><div class="number">0</div><div class="title">TIER</div></div><div class="tier-icon float-right"></div></div></div></div><nav><div class="nav nav-tabs pm_custom_tabs clearfix" id="pretty-tabContent-tabs"><a id="nav-prettyDash-tab" class="nav-item nav-link active" data-toggle="tab" href="#nav-prettyDash"><span><i class="fa fa-desktop"></i> Dashboard</span></a><a id="nav-prettyAnalytics-tab" class="nav-item nav-link ' + (G_IS_PRO ? "" : "not-pro") + '" data-toggle="tab" href="#nav-prettyAnalytics"><span><i class="fa fa-bar-chart"></i> Analytics ' + T + '</span></a><a id="nav-prettyProducts-tab" class="nav-item nav-link ' + (G_IS_PRO ? "" : "not-pro") + '" data-toggle="tab" href="#nav-prettyProducts"><span><i class="fa fa-bars"></i> Products ' + T + '</span></a><a id="nav-prettyResearch-tab" class="nav-item nav-link ' + ("pro+" == G_PRO_PLAN ? "" : "not-pro") + '" data-toggle="tab" href="#nav-prettyResearch"><span><i class="fa fa-search"></i> Research ' + L + '</span></a><div style="position:absolute; right:0"><div class="nav-item nav-link no-tab float-left trigger-options-modal" href=""><i class="fa fa-cog"></i> Options</div>' + (G_IS_PRO ? "" : '<div class="nav-item no-tab float-left enter-licence" href=""><i class="fa fa-unlock" style="margin-right: 4px"></i> Upgrade to Pro</div>') + '</div></div></nav><div class="tab-content" id="pretty-tabContent"><div id="nav-prettyDash" class="tab-pane fade show active trigger-lazy-load-images"><div class="row dash-top-stats-row"><i class="fa fa-circle-o-notch fa-spin loading-icon"></i><div class="col dash-top-stats daily-limit"><div class="title">Uploaded Today</div><div class="progress-text uploads clearfix"><span class="used">0</span> of <span class="limit">0</span><span class="progress-percent"></span></div><div class="progress"><div class="progress-bar" style="width: 0%; background-color:rgba(75, 192, 192, 1)"></div></div><div class="progress-text special-message hidden"></div></div><div class="col dash-top-stats published-designs"><div class="title">Live Designs</div><div class="progress-text clearfix"><span class="used">0</span> of <span class="limit">0</span><span class="progress-percent"></span></div><div class="progress"><div class="progress-bar" style="width: 0%; background-color:rgba(255, 206, 86, 1)"></div></div></div><div class="col dash-top-stats total-limit"><div class="title">Live Products</div><div class="progress-text clearfix"><span class="used">0</span> of <span class="limit">0</span><span class="progress-percent"></span></div><div class="progress"><div class="progress-bar" style="width: 0%; background-color:rgba(255, 206, 86, 1)"></div></div></div><div class="col dash-top-stats products-with-sales"><div class="title">Products with Sales</div><div class="progress-text"><span class="used">0</span> of <span class="limit">0</span> live <span class="progress-percent"></span></div><div class="progress"><div class="progress-bar" style="width: 0%; background-color:rgba(255, 206, 86, 1)"></div></div></div><div class="dash-top-stats products-with-reviews text-center" style="width: 160px;"><div class="title">Reviews</div><div class="reviews"><div class="review-stars"><span style="width: 0%"></span></div></div><div class="progress-text special-message text-center"><span class="review-score">0.0</span> from <span class="review-total">0</span> reviews</span></div></div></div><div class="row" style="margin-bottom: 20px"><div class="col-4"><div class="card today-card"><div class="card-body sales-summary init-loader today"><div class=""><div class="title title-lg clearfix">Today\'s Sales<span class="subtitle"></span><div class="float-right text-right"></div></div><div class="net-sales odometer">0</div><div class="row no-gutters small-values"><div class="col" style="cursor: default" title="Sold - Cancelled"><span class="total-sales">0</span> - <span class="cancelled">0</span></div><div class="col"><span class="returned"><span class="number">0</span></span></div><div class="col" style="cursor: default"><span class="royalties"><span class="currency-symbol">$</span><span class="number">0</span></span></div></div><div class="row no-gutters small-titles"><div class="col"><span class="">Sold</span> - <span class="" style="margin-right: 6px">Cancelled</span></div><div class="col"><span class="">Returned</span></div><div class="col"><span class="">Royalties</span></div></div></div></div></div></div><div class="col-8"><div class="card"><div class="card-body last-seven-days-chart" style="padding:0"><div class="title title-lg hidden">Last 7 Days<span class="subtitle"></span></div><canvas id="last-seven-days-chart" data-display="daily"></canvas></div></div></div></div><div class="row" style=""><div class="col-6" style="padding-right:0"><div class="card"><div class="card-body" style="padding: 15px 0 0px 0"><nav class="nav nav-tabs pm_custom_tabs" id="myTab" style="position:relative"><a class="nav-item nav-link active" id="nav-home-tab" data-toggle="tab" href="#nav-1" style="font-weight:600"><span><i class="fa fa-money" style="color: #28a745"></i> TODAY</span></a><a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#nav-2" >Top Units Sold</a><a class="nav-item nav-link" id="nav-contact-tab" data-toggle="tab" href="#nav-3" >Top Royalties</a><div class="switch-wrapper clearfix" style="position:absolute; right:0; bottom:10px;" data-toggle="tooltip" data-html="true" title="Screenshot Mode<br/>Hides titles for screenshot"><i class="fa fa-eye-slash" style="margin-right:3px; cursor: help" ></i><div class="switch-container float-right"><label for="blur_switch"><input type="checkbox" id="blur_switch" class="hide-titles" /><span class="switch"></span><span class="toggle"></span></label></div></div></nav><div class="tab-content" id="nav-tabContent" style="padding-top:5px"><div class="tab-pane fade show active lazy-load-images-container trigger-lazy-load-images" id="nav-1" role="tabpanel"><div class="todays-shirts-list"></div></div><div class="tab-pane fade lazy-load-images-container trigger-lazy-load-images" id="nav-2" role="tabpanel"><div class="sales-summary init-loader top-sellers"><div class="top-sales-list" style="height: 323px;"></div></div></div><div class="tab-pane fade lazy-load-images-container trigger-lazy-load-images" id="nav-3" role="tabpanel"><div class="sales-summary init-loader top-sellers"><div class="top-royalties-list" style="height: 323px;"></div></div></div></div></div></div></div><div class="col-6"><div class="card"><div class="card-body" style="padding-right:0; padding-bottom: 0px;"><div class="row" style="margin-bottom:15px; padding-bottom:15px"><div class="col-6 xcard-border-right"><div class="sales-summary summary-style-2 init-loader yesterday clearfix"><div class="title title-sm">Yesterday<span class="subtitle"></span><div class="text-right float-right"><div class="show-sales-modal btn btn-light btn-sm btn-icon ' + (G_IS_PRO ? "" : "not-pro") + '" data-period="yesterday" data-toggle="tooltip" title="View Sales"><i class="fa fa-list-ul"></i>' + T + '</div></div></div><div class="net-sales">0</div><div class="small-values"><div class="royalties-container"><span class="royalties"><span class="currency-symbol">$</span><span class="number">0</span></span></div><div class="sold-container" title="Sold - Cancelled (Returned)"><span class="total-sales">0</span> - <span class="cancelled" style="margin-right: 6px">0</span>(<span class="returned">0</span>)</div></div></div></div><div class="col-6"><div class="sales-summary summary-style-2 init-loader last-seven-days clearfix"><div class="title title-sm">Last 7 Days<span class="subtitle"></span><div class="text-right float-right"><div class="show-sales-modal btn btn-light btn-sm btn-icon ' + (G_IS_PRO ? "" : "not-pro") + '" data-period="last-seven-days" data-toggle="tooltip" title="View Sales"><i class="fa fa-list-ul"></i>' + T + '</div></div></div><div class="net-sales">0</div><div class="small-values"><div class="royalties-container"><span class="royalties"><span class="currency-symbol">$</span><span class="number">0</span></span></div><div class="sold-container" title="Sold - Cancelled (Returned)"><span class="total-sales">0</span> - <span class="cancelled" style="margin-right: 6px">0</span>(<span class="returned">0</span>)</div></div></div></div></div><div class="row" style="margin-bottom:15px; padding-bottom:15px"><div class="col-6"><div class="sales-summary summary-style-2 init-loader this-month clearfix"><div class="title title-sm">This Month<span class="subtitle"></span><div class="text-right float-right"><div class="show-sales-modal btn btn-light btn-sm btn-icon ' + (G_IS_PRO ? "" : "not-pro") + '" data-period="this-month" data-toggle="tooltip" title="View Sales"><i class="fa fa-list-ul"></i>' + T + '</div></div></div><div class="net-sales">0</div><div class="small-values"><div class="royalties-container"><span class="royalties"><span class="currency-symbol">$</span><span class="number">0</span></span></div><div class="sold-container" title="Sold - Cancelled (Returned)"><span class="total-sales">0</span> - <span class="cancelled" style="margin-right: 6px">0</span>(<span class="returned">0</span>)</div></div></div></div><div class="col-6"><div class="sales-summary summary-style-2 init-loader previous-month clearfix"><div class="title title-sm">Previous Month<span class="subtitle"></span><div class="text-right float-right"><div class="show-sales-modal btn btn-light btn-sm btn-icon ' + (G_IS_PRO ? "" : "not-pro") + '" data-period="previous-month" data-toggle="tooltip" title="View Sales"><i class="fa fa-list-ul"></i>' + T + '</div></div></div><div class="net-sales">0</div><div class="small-values"><div class="royalties-container"><span class="royalties"><span class="currency-symbol">$</span><span class="number">0</span></span></div><div class="sold-container" title="Sold - Cancelled (Returned)"><span class="total-sales">0</span> - <span class="cancelled" style="margin-right: 6px">0</span>(<span class="returned">0</span>)</div></div></div></div></div><div class="row"><div class="col-12"><div class="sales-summary summary-style-2 all-time clearfix"><div class="title title-sm clearfix">All Time<span class="subtitle"></span><span class="refresh-all-time-no-cache" data-toggle="tooltip" data-placement="top" data-html="true" title="Clear cache and Refresh"><i class="fa fa-refresh"></i></span><div class="text-right float-right"><div class="show-sales-modal btn btn-light btn-sm btn-icon ' + (G_IS_PRO ? "" : "not-pro") + '" style="margin-right: 5px" data-period="all-time" data-toggle="tooltip" title="View Sales"><i class="fa fa-list-ul"></i>' + T + '</div><div class="show-all-time-modal btn btn-light btn-sm btn-icon" data-toggle="tooltip" data-placement="top" data-html="true" title="View Chart"><i class="fa fa-bar-chart"></i></div></div></div><div class="net-sales">0</div><div class="small-values"><div class="royalties-container"><span class="royalties"><span class="currency-symbol">$</span><span class="number">0</span></span></div><div class="sold-container" title="Sold - Cancelled - (Returned)"><span class="total-sales">0</span> - <span class="cancelled" style="">0</span> - (<span class="returned">0</span>)</div></div></div></div></div></div></div></div></div></div><div id="nav-prettyAnalytics" class="tab-pane fade lazy-load-images-container trigger-lazy-load-images"><div class="analytics-containter" style="position: relative"><div class="analytics-section-title" style="margin-bottom: 14px;">Analyze Sales</div>' + (G_IS_PRO ? "" : '<div class="alert alert-warning" style="padding: 8px 12px; margin-bottom: 15px;">Free accounts can analyze Today\'s sales. <a href="" class="enter-licence" style="font-weight: bold">Upgrade to Pro</a> to enable all date ranges</div>') + '<div class="analytics-filters-container clearfix"><div class="analytics-filters-row clearfix"><div class="analytics-filters-title" style="padding-top: 44px;">Select dates</div><div class="analytics-filters-option"><div class="datepicker-container clearfix"><input type="hidden" class="caleran-datepicker"></input><div class="datepicker-trigger clearfix" style=""><div class="start-date"></div><div class="date-divider"><i class="fa fa-arrow-right"></i></div><div class="end-date"></div></div><div class="clearfix"></div><div class="quick-dateranges clearfix"></div></div></div></div><div class="analytics-filters-row clearfix" style="padding-bottom: 7px"><div class="analytics-filters-title" style="padding-top: 6px">Select marketplace</div><div class="analytics-filters-option clearfix"><div class="analytics-marketplace-filter clearfix"><div class="pm_btn has-bg-image toggle-marketplace-filter selected" data-marketplace="usa" style="background-image: url(' + chrome.extension.getURL("/assets/img/flag_USA_256_min.png") + ')">United States</div> <div class="pm_btn has-bg-image toggle-marketplace-filter" data-marketplace="uk" style="background-image: url(' + chrome.extension.getURL("/assets/img/flag_UK_256_min.png") + ')">United Kingdom</div> <div class="pm_btn has-bg-image toggle-marketplace-filter" data-marketplace="ger" style="background-image: url(' + chrome.extension.getURL("/assets/img/flag_DE_256_min.png") + ')">Germany</div> <div class="pm_btn has-bg-image toggle-marketplace-filter" data-marketplace="fr" style="background-image: url(' + chrome.extension.getURL("/assets/img/flag_FR_256_min.png") + ')">France</div> <div class="pm_btn has-bg-image toggle-marketplace-filter" data-marketplace="it" style="background-image: url(' + chrome.extension.getURL("/assets/img/flag_IT_256_min.png") + ')">Italy</div> <div class="pm_btn has-bg-image toggle-marketplace-filter" data-marketplace="es" style="background-image: url(' + chrome.extension.getURL("/assets/img/flag_ES_256_min.png") + ')">Spain</div> <div class="pm_btn has-bg-image toggle-marketplace-filter" data-marketplace="jp" style="background-image: url(' + chrome.extension.getURL("/assets/img/flag_JP_256_min.png") + ')">Japan</div> </div></div></div><div class="analytics-filters-row text-center clearfix"><button id="submit-analytics" type="button" class="btn btn-primary" style="">Analyze Sales</button></div></div><div class="analytics-results-containter" style="position: relative;"><div class="analytics_placeholder">Select a date range and marketplace<br/>and then click Analyze Sales</div><div class="analytics-section analytics-grand-title hidden"><div class="title">Analytics for <span class="title-date"></span></div><div class="subtitle"><span class="date-range"></span></div></div><div class="analytics_chart analytics-section hidden"><div class="analytics_chart_buttons clearfix" style="margin-bottom: 15px"><div class="float-left clearfix" style="margin-right: 30px"><div class="pm_button_title_top clearfix">Chart style</div> <div class="pm_btn_radio_container clearfix"><div class="pm_btn toggle_chart_layout selected" data-layout="daily">Daily</div> <div class="pm_btn toggle_chart_layout" data-layout="monthly">Monthly</div> </div></div><div class="clearfix float-left"><div class="pm_button_title_top clearfix">Toggle data</div> <div class="pm_btn toggle_chart_data selected" data-target="royalties">Royalties</div> <div class="pm_btn toggle_chart_data selected" data-target="sold">Sales</div> </div><div class="float-right clearfix"><div class="pm_button_title_top clearfix">Chart size</div> <div class="pm_btn_radio_container clearfix"><div class="pm_btn change_chart_view selected" data-view="default">Default</div> <div class="pm_btn change_chart_view" data-view="full">Full Width</div> </div></div></div><div class="analytics_chart_container" style="width: 1190px; height: 475px;"><canvas id="analytics_sales_chart" data-display="daily"></canvas></div></div><div class="analytics-section clearfix hidden"><div class="analytics-row grand-totals clearfix"><div class="title">TOTAL SALES</div><div class="analytics-content clearfix"><div class="analytics-item"><div class="number"><span class="sales">888888</span></div></div></div></div><div class="analytics-row mrkt-totals clearfix"><div class="clearfix"><div class="analytics-item flag">&nbsp;</div><div class="analytics-item sales"><div class="analytics-item-title">Sales</div></div><div class="analytics-item returns"><div class="analytics-item-title">Returns</div></div><div class="analytics-item royalties"><div class="analytics-item-title">Royalties</div></div><div class="analytics-item royalties-per-sale"><div class="analytics-item-title">Royalties/Sale</div></div></div><div class="sales-per-marketplace"></div></div></div><div class="analytics-section bg-grey clearfix hidden sales-averages"><div class="row analytics-row clearfix avg-per-day"><div class="col-3 align-self-center"><div class="analytics-section-title">Averages per Day <span class="subtitle">(for x days)</span></div></div><div class="col"><div class="row"><div class="col-4"><div class="analytics-item avg-sales-day"><div class="analytics-item-title">Sales/Day</div><div class="number"></div></div></div><div class="col-4"><div class="analytics-item avg-returns-day"><div class="analytics-item-title">Returns/Day</div><div class="number"></div></div></div><div class="col-4"><div class="analytics-item avg-royalties-day"><div class="analytics-item-title">Royalties/Day</div><div class="number"><span class="currency-symbol">$</span><span class="number_int">0</span><span class="number_dec">00</span></div></div></div><div class="clearfix"></div><div class="col"><div class="explanation-block"></div></div></div></div></div><div class="row analytics-row clearfix avg-per-month"><div class="col-3 align-self-center"><div class="analytics-section-title">Averages per Month <span class="subtitle">(for x months)</span></div></div><div class="col"><div class="row"><div class="col-4"><div class="analytics-item avg-sales-month"><div class="analytics-item-title">Sales/Month</div><div class="number"></div></div></div><div class="col-4"><div class="analytics-item avg-returns-month"><div class="analytics-item-title">Returns/Month</div><div class="number"></div></div></div><div class="col-4"><div class="analytics-item avg-royalties-month"><div class="analytics-item-title">Royalties/Month</div><div class="number"><span class="currency-symbol">$</span><span class="number_int">0</span><span class="number_dec">00</span></div></div></div><div class="clearfix"></div><div class="col"><div class="explanation-block">tesfkjb sekjhfbsenj fjkesfjlhase f</div></div></div></div></div></div><div class="analytics-section clearfix hidden record-days-months"><div class="row analytics-row clearfix record-days"><div class="col-3 align-self-center"><div class="analytics-section-title">Record Days</div></div><div class="col"><div class="row"><div class="col-4"><div class="analytics-item record-sales-day"><div class="analytics-item-title">Sales</div><div class="number"></div><div class="footer"></div></div></div><div class="col-4"><div class="analytics-item record-returns-day"><div class="analytics-item-title">Returns</div><div class="number"></div><div class="footer"></div></div></div><div class="col-4"><div class="analytics-item record-royalties-day"><div class="analytics-item-title">Royalties</div><div class="number"><span class="currency-symbol">$</span><span class="number_int">0</span><span class="number_dec">00</span></div><div class="footer"></div></div></div><div class="clearfix"></div><div class="col"><div class="explanation-block"></div></div></div></div></div><div class="row analytics-row clearfix record-months"><div class="col-3 align-self-center"><div class="analytics-section-title">Record Months</div></div><div class="col"><div class="row"><div class="col-4"><div class="analytics-item record-sales-month"><div class="analytics-item-title">Sales</div><div class="number"></div><div class="footer"></div></div></div><div class="col-4"><div class="analytics-item record-returns-month"><div class="analytics-item-title">Returns</div><div class="number"></div><div class="footer"></div></div></div><div class="col-4"><div class="analytics-item record-royalties-month"><div class="analytics-item-title">Royalties</div><div class="number"><span class="currency-symbol">$</span><span class="number_int">0</span><span class="number_dec">00</span></div><div class="footer"></div></div></div><div class="clearfix"></div><div class="col"><div class="explanation-block"></div></div></div></div></div></div><div class="analytics-section bg-grey clearfix hidden products-vs-sales-royalties"><div class="row analytics-row clearfix product-performance"><div class="col-3 align-self-center"><div class="analytics-section-title">Product Performance</div></div><div class="col"><div class="row"><div class="col-6"><div class="analytics-item unique-products"><div class="analytics-item-title">Unique Products Sold</div><div class="number"></div></div></div><div class="col-6"><div class="analytics-item percent-of-live"><div class="analytics-item-title">% of All Live Products</div><div class="number"></div></div></div></div></div></div><div class="row analytics-row clearfix 80-20-rule"><div class="col-3 align-self-center"><div class="analytics-section-title">80/20 Rule</div></div><div class="col"><div class="row"><div class="col-6 products-vs-sales"><div class="analytics-item"><div class="analytics-item-title">Products / Sales</div><div class="number"></div><div class="footer"></div></div></div><div class="col-6 products-vs-royalties"><div class="analytics-item"><div class="analytics-item-title">Products / Royalties</div><div class="number"></div><div class="footer"></div></div><div class="explanation-block hidden"></div></div></div></div></div></div><div class="analytics-section top-products-fit-color clearfix hidden"><div class="row analytics-row clearfix record-months"><div class="col-3 align-self-center"><div class="analytics-section-title">Top Product Types</div></div><div class="col"><div class="top-products"></div></div></div><div class="row analytics-row clearfix record-months"><div class="col-3 align-self-center"><div class="analytics-section-title">Top Fit Types</div></div><div class="col"><div class="top-fit-types"></div></div></div><div class="row analytics-row clearfix record-months"><div class="col-3 align-self-center"><div class="analytics-section-title">Top Colors</div></div><div class="col"><div class="analytics-top-colors"></div></div></div></div><div class="analytics-section clearfix hidden"><div class="analytics-row clearfix"><div class="analytics-content clearfix"><div class="analytics-section-title" style="margin-bottom: 30px;">Products Sold</div><div class="products-sold-table-container"data-sort-by="" data-sort-order="" data-search-query="" data-filter-product="" data-filter-color="" data-filter-marketplace="" ><div class="analytics-content products-sold-table-filters clearfix"><div class="product-search-query-container float-left"><div class="pm_button_title_top clearfix">Search Products</div> <input type="text" name="product-search-query" placeholder="Search Title or Asin" class="form-control" autocomplete="off" autofill="off"><i class="fa fa-circle-o-notch fa-spin search-query-spinner"></i></div><div class="clearfix float-left" style="margin-left: 10px;"><div class="pm_button_title_top clearfix">Product Types</div> <select class="pm_btn product_filter" data-filter="product"></select> </div><div class="clearfix float-left" style="margin-left: 10px;"><div class="pm_button_title_top clearfix">Colors</div> <select class="pm_btn color_filter" data-filter="color"></select> </div><div class="clearfix float-left" style="margin-left: 10px;"><div class="pm_button_title_top clearfix">Market</div> <select class="pm_btn market_filter" data-filter="marketplace"></select> </div><div class="clearfix float-left" style="margin-left: 10px;"><div class="pm_button_title_top clearfix">&nbsp;</div> <div class="pm_btn clear_filters" data-toggle="tooltip" title="Clear Filters"><i class="fa fa-eraser" style="line-height: 18px"></i></div> </div><div class="product-count float-right"><span class="filtered-products-shown hidden">Filtered <span class="number">0</span> of </span><span class="total-proucts-shown"><span class="number">0</span> products</span></div></div><div class="analytics-content products-sold-table clearfix"></div></div></div></div></div></div></div></div><div id="nav-prettyProducts" class="tab-pane fade lazy-load-images-container trigger-lazy-load-images"><div id="manage-products-containter" class="" style=""><div class="analytics-section-title" style="margin-bottom: 14px;">Manage Products' + (l && i == s ? '<div class="pm_btn db-progress-container"><div class="clearfix"><i class="fa fa-check-circle float-right complete"></i><div class="db_progress_number hidden float-right">100.00%</div><div class="db_progress_text float-right">Database Updated</div></div><div class="db-progress-inner"><div class="db_progress_bar"></div></div></div> ' : '<div class="pm_btn db-progress-container"><div class="clearfix"><i class="fa fa-clock-o float-right pending"></i><div class="db_progress_number hidden float-right">100.00%</div><div class="db_progress_text float-right">Database Update Scheduled</div></div><div class="db-progress-inner"><div class="db_progress_bar"></div></div></div> ') + "</div>" + (G_IS_PRO ? "" : '<div class="alert alert-warning" style="padding: 8px 12px; margin-bottom: 15px;">Free accounts can manage up to 500 products. <a href="" class="enter-licence" style="font-weight: bold">Upgrade to Pro</a> to enable all products.</div>') + '<div class="manage-products-table-container auto-refresh-table" style="position: relative;"data-sort-by="" data-sort-order="" data-search-query="" data-filter-search_text_in="" data-filter-marketplace="" data-filter-product="" data-filter-status="" data-filter-is_buyable="" data-filter-has_sales="" data-filter-pending_removal="" data-filter-price="" data-filter-published_date="" data-filter-reviews="" data-filter-bsr="" ><div class="manage-products-filters-container clearfix"><div class="manage-products-filters-row clearfix" style="padding-top:0; padding-bottom: 12px;"><div class="manage-products-filters-title">Search</div><div class="manage-products-filters-options clearfix"><div class="manage-products-search-query-container" style="display: inline-block"><input type="text" name="manage-products-search-query" placeholder="Search" class="form-control" autocomplete="off" autofill="off"><i class="fa fa-circle-o-notch fa-spin search-query-spinner"></i><div class="search-query-help"><span>ESC</span> to clear</div></div><div class="manage-products-filter clearfix" data-filter-style="single-select" data-filter="search_text_in"><div class="manage-products-filters-options-all_column clearfix"><div class="pm_btn has-bg-icon mb-0 manage-products-filter-option is-all-filter" data-value="all"><i class="fa fa-bars"></i>All</div> </div><div class="manage-products-filters-options-options_column clearfix"><div class="pm_btn_radio_container clearfix"><div class="pm_btn mb-0 manage-products-filter-option is-default-filter selected" data-value="title">Title</div> <div class="pm_btn mb-0 manage-products-filter-option" data-value="brand">Brand</div> <div class="pm_btn mb-0 manage-products-filter-option" data-value="bullets">Bullets</div> <div class="pm_btn mb-0 manage-products-filter-option" data-value="description">Description</div> <div class="pm_btn mb-0 manage-products-filter-option" data-value="asin">ASIN</div> </div></div></div></div></div><div class="manage-products-filters-row clearfix"><div class="manage-products-filters-title">Marketplace</div><div class="manage-products-filters-options clearfix"><div class="manage-products-filter clearfix" data-filter-style="single-select" data-filter="marketplace"><div class="manage-products-filters-options-all_column clearfix"><div class="pm_btn has-bg-icon manage-products-filter-option is-all-filter is-default-filter selected" data-value="all"><i class="fa fa-globe"></i>All</div> </div><div class="manage-products-filters-options-options_column clearfix"><div class="pm_btn has-bg-image manage-products-filter-option" data-value="US" style="background-image: url(' + chrome.extension.getURL("/assets/img/flag_USA_256_min.png") + ')">United States</div> <div class="pm_btn has-bg-image manage-products-filter-option" data-value="GB"  style="background-image: url(' + chrome.extension.getURL("/assets/img/flag_UK_256_min.png") + ')">United Kingdom</div> <div class="pm_btn has-bg-image manage-products-filter-option" data-value="DE" style="background-image: url(' + chrome.extension.getURL("/assets/img/flag_DE_256_min.png") + ')">Germany</div> <div class="pm_btn has-bg-image manage-products-filter-option" data-value="FR" style="background-image: url(' + chrome.extension.getURL("/assets/img/flag_FR_256_min.png") + ')">France</div> <div class="pm_btn has-bg-image manage-products-filter-option" data-value="IT" style="background-image: url(' + chrome.extension.getURL("/assets/img/flag_IT_256_min.png") + ')">Italy</div> <div class="pm_btn has-bg-image manage-products-filter-option" data-value="ES" style="background-image: url(' + chrome.extension.getURL("/assets/img/flag_ES_256_min.png") + ')">Spain</div> <div class="pm_btn has-bg-image manage-products-filter-option" data-value="JP" style="background-image: url(' + chrome.extension.getURL("/assets/img/flag_JP_256_min.png") + ')">Japan</div> </div></div></div></div><div class="collapse" id="collapse_product_filters"><div class="manage-products-filters-row clearfix"><div class="manage-products-filters-title">Product</div><div class="manage-products-filters-options clearfix"><div class="manage-products-filter product-filter-options clearfix" data-filter-style="single-select" data-filter="product"><div class="manage-products-filters-options-all_column clearfix"><div class="pm_btn has-bg-icon manage-products-filter-option is-all-filter is-default-filter selected" data-value="all"><i class="fa fa-shopping-bag"></i>All</div> </div><div class="manage-products-filters-options-options_column clearfix"><div class="pm_btn manage-products-filter-option" data-value="">Loading product types</div> </div></div></div></div><div class="manage-products-filters-row clearfix"><div class="manage-products-filters-title">Status</div><div class="manage-products-filters-options clearfix"><div class="manage-products-filter clearfix" data-filter-style="single-select" data-filter="status"><div class="manage-products-filters-options-all_column clearfix"><div class="pm_btn has-bg-icon manage-products-filter-option is-all-filter is-default-filter selected" data-value="all"><i class="fa fa-dot-circle-o"></i>All</div> </div><div class="manage-products-filters-options-options_column clearfix"><div class="pm_btn manage-products-filter-option" data-value="DRAFT">Draft</div> <div class="pm_btn manage-products-filter-option" data-value="PUBLISHED">Live</div> <div class="pm_btn manage-products-filter-option" data-value="PROPAGATED">Auto Uploaded</div> <div class="pm_btn manage-products-filter-option" data-value="REVIEW">Under review</div> <div class="pm_btn manage-products-filter-option" data-value="TRANSLATING">Translating</div> <div class="pm_btn manage-products-filter-option" data-value="PUBLISHING">Processing</div> <div class="pm_btn manage-products-filter-option" data-value="TIMED_OUT">Timed Out</div> <div class="pm_btn manage-products-filter-option" data-value="AMAZON_REJECTED">Rejected</div> <div class="pm_btn manage-products-filter-option" data-value="DELETED">Removed</div> </div></div></div></div><div class="manage-products-filters-row clearfix"><div class="manage-products-filters-title">Created Date</div><div class="manage-products-filters-options clearfix"><div class="manage-products-filter clearfix" data-filter-style="single-select" data-filter="published_date"><div class="manage-products-filters-options-all_column clearfix"><div class="pm_btn has-bg-icon manage-products-filter-option is-all-filter is-default-filter selected" data-value="all"><i class="fa fa-calendar"></i>All</div> </div><div class="manage-products-filters-options-options_column clearfix"><div class="pm_btn_radio_container clearfix"><div class="pm_btn manage-products-filter-option" data-value="less_than">Before</div> <div class="pm_btn manage-products-filter-option" data-value="equals">On</div> <div class="pm_btn manage-products-filter-option" data-value="more_than">After</div> <div class="manage-products-published-date-query-container float-left" style="position: relative"><input type="text" name="manage-products-published-date-query" placeholder="Select Date" class="form-control"><i class="fa fa-circle-o-notch fa-spin search-query-spinner"></i></div></div></div></div></div></div><div class="manage-products-filters-row clearfix"><div class="manage-products-filters-title">Price</div><div class="manage-products-filters-options clearfix"><div class="manage-products-filter clearfix" data-filter-style="single-select" data-filter="price"><div class="manage-products-filters-options-all_column clearfix"><div class="pm_btn has-bg-icon manage-products-filter-option is-all-filter is-default-filter selected" data-value="all"><i class="fa fa-usd"></i>All</div> </div><div class="manage-products-filters-options-options_column clearfix"><div class="pm_btn_radio_container clearfix"><div class="pm_btn manage-products-filter-option" data-value="less_than">Less than</div> <div class="pm_btn manage-products-filter-option" data-value="equals">Equal to</div> <div class="pm_btn manage-products-filter-option" data-value="more_than">More than</div> <div class="pm_btn manage-products-filter-option" data-value="between">Between</div> <div class="manage-products-price-query-container float-left"><input type="number" name="manage-products-price-query" placeholder="Enter Price" class="form-control"><i class="fa fa-circle-o-notch fa-spin search-query-spinner"></i></div><div class="manage-products-price-query-container hide float-left" style="margin-left: 9px"><i class="fa fa-arrow-circle-right" style="position: absolute; top: 5px; font-size: 18px; left: -14px; color: #757575; background-color: #fff; border-radius: 50%; border: 2px solid #fff;"></i><input type="number" name="manage-products-price-query-2" placeholder="To Price" class="form-control" style="border-radius: 4px;"><i class="fa fa-circle-o-notch fa-spin search-query-spinner"></i></div></div></div></div></div></div><div class="manage-products-filters-row clearfix"><div class="manage-products-filters-title">Has Sold</div><div class="manage-products-filters-options clearfix"><div class="manage-products-filter clearfix" data-filter-style="single-select" data-filter="has_sales"><div class="manage-products-filters-options-all_column clearfix"><div class="pm_btn has-bg-icon manage-products-filter-option is-all-filter is-default-filter selected" data-value="all"><i class="fa fa-money"></i>All</div> </div><div class="manage-products-filters-options-options_column clearfix"><div class="pm_btn manage-products-filter-option" data-toggle="tooltip" title="Has Sold" data-value="true">Yes</div> <div class="pm_btn manage-products-filter-option" data-toggle="tooltip" title="Has Not Sold" style="margin-right: 16px" data-value="false">No</div> <div class="pm_btn_radio_container clearfix"><div class="pm_btn manage-products-filter-option" data-value="less_than">Less than</div> <div class="pm_btn manage-products-filter-option" data-value="equals">Equal to</div> <div class="pm_btn manage-products-filter-option" data-value="more_than">More than</div> <div class="pm_btn manage-products-filter-option" data-value="between">Between</div> <div class="manage-products-sales-query-container float-left"><input type="number" name="manage-products-sales-query" placeholder="Units Sold" class="form-control" style="width: 100px;"><i class="fa fa-circle-o-notch fa-spin search-query-spinner"></i></div><div class="manage-products-sales-query-container hide float-left" style="margin-left: 9px"><i class="fa fa-arrow-circle-right" style="position: absolute; top: 5px; font-size: 18px; left: -14px; color: #757575; background-color: #fff; border-radius: 50%; border: 2px solid #fff;"></i><input type="number" name="manage-products-sales-query-2" placeholder="To Units" class="form-control" style="border-radius: 4px; width: 100px;"><i class="fa fa-circle-o-notch fa-spin search-query-spinner"></i></div></div></div></div></div></div><div class="manage-products-filters-row clearfix"><div class="manage-products-filters-title">Last Sale Date</div><div class="manage-products-filters-options clearfix"><div class="manage-products-filter clearfix" data-filter-style="single-select" data-filter="date_of_last_sale"><div class="manage-products-filters-options-all_column clearfix"><div class="pm_btn has-bg-icon manage-products-filter-option is-all-filter is-default-filter selected" data-value="all"><i class="fa fa-calendar"></i>All</div> </div><div class="manage-products-filters-options-options_column clearfix"><div class="pm_btn_radio_container clearfix"><div class="pm_btn manage-products-filter-option" data-value="less_than">Before</div> <div class="pm_btn manage-products-filter-option" data-value="equals">On</div> <div class="pm_btn manage-products-filter-option" data-value="more_than">After</div> <div class="manage-products-last-sale-date-query-container float-left" style="position: relative"><input type="text" name="manage-products-last-sale-date-query" placeholder="Select Date" class="form-control"><i class="fa fa-circle-o-notch fa-spin search-query-spinner"></i></div></div></div></div></div></div><div class="manage-products-filters-row clearfix"><div class="manage-products-filters-title">Reviews</div><div class="manage-products-filters-options clearfix"><div class="manage-products-filter clearfix" data-filter-style="single-select" data-filter="reviews"><div class="manage-products-filters-options-all_column clearfix"><div class="pm_btn has-bg-icon manage-products-filter-option is-all-filter is-default-filter selected" data-value="all"><i class="fa fa-star"></i>All</div> </div><div class="manage-products-filters-options-options_column clearfix"><div class="pm_btn manage-products-filter-option" data-toggle="tooltip" title="Has Reviews" data-value="0, 5, false, true, true">Yes</div> <div class="pm_btn manage-products-filter-option" data-toggle="tooltip" title="No Reviews" style="margin-right: 16px" data-value="0, 0, true, true, false">No</div> <div class="pm_btn manage-products-filter-option" data-value="0, 3, false, true">1 to 3 stars</div> <div class="pm_btn manage-products-filter-option" data-value="3, 5, false, true">3.1 to 5 stars</div> </div></div></div></div><div class="manage-products-filters-row clearfix"><div class="manage-products-filters-title">BSR</div><div class="manage-products-filters-options clearfix"><div class="manage-products-filter clearfix" data-filter-style="single-select" data-filter="bsr"><div class="manage-products-filters-options-all_column clearfix"><div class="pm_btn has-bg-icon manage-products-filter-option is-all-filter is-default-filter selected" data-value="all"><i class="fa fa-sort-numeric-asc"></i>All</div> </div><div class="manage-products-filters-options-options_column clearfix"><div class="pm_btn manage-products-filter-option"  data-toggle="tooltip" title="Has BSR" data-value="0, Infinity, false, false, true">Yes</div> <div class="pm_btn manage-products-filter-option"  data-toggle="tooltip" title="No BSR" style="margin-right: 16px" data-value="0, 0, true, true, false">No</div> <div class="pm_btn manage-products-filter-option" data-value="0, 10000, false, false">Under 10k</div> <div class="pm_btn manage-products-filter-option" data-value="10000, 50000, false, true">10k to 50k</div> <div class="pm_btn manage-products-filter-option" data-value="50000, 100000, false, true">50k to 100k</div> <div class="pm_btn manage-products-filter-option" data-value="100000, Infinity, false, true">Over 100k</div> </div></div></div></div><div class="manage-products-filters-row clearfix"><div class="manage-products-filters-title">Pending Removal</div><div class="manage-products-filters-options clearfix"><div class="manage-products-filter clearfix" data-filter-style="single-select" data-filter="pending_removal"><div class="manage-products-filters-options-all_column clearfix"><div class="pm_btn has-bg-icon manage-products-filter-option is-all-filter is-default-filter selected" data-value="all"><i class="fa fa-flag"></i>All</div> </div><div class="manage-products-filters-options-options_column clearfix"><div class="pm_btn manage-products-filter-option" data-value="-1">Less than 1 day</div> <div class="pm_btn manage-products-filter-option" data-value="1">1 to 8 days</div> <div class="pm_btn manage-products-filter-option" data-value="2">8 to 30 days</div> <div class="pm_btn manage-products-filter-option" data-value="3">31 to 60 days</div> <div class="pm_btn manage-products-filter-option" data-value="4">61 to 90 days</div> <div class="pm_btn manage-products-filter-option" data-value="5">91 to 180 days</div> </div></div></div></div></div><div class="manage-products-filters-row clearfix" style="position: relative; border: none; padding-bottom: 0;"><div class="manage-products-filters-title">&nbsp;</div><div class="manage-products-filters-options clearfix"><div class="pm_btn has-bg-icon manage-products-clear_filters"><i class="fa fa-eraser"></i>Clear Filters</div> <div class="pm_btn has-bg-icon manage-products-collapse_filters" data-toggle="collapse" href="#collapse_product_filters"><i class="fa fa-chevron-down"></i>More Filters</div> <div class="pm_btn has-bg-icon search-progress-container"><div><i class="fa fa-circle-o-notch fa-spin"></i>Searching</div><div class="search-progress-inner"></div></div> </div></div></div><div class="manage-products-table clearfix"></div></div></div></div><div id="nav-prettyResearch" class="tab-pane fade"><div class="" style=""><nav class="clearfix"><div class="pm_nav nav nav-pills float-left clearfix"><div id="nav-researchTrends-tab" class="nav-item pm_btn has-bg-icon selected active" data-toggle="pill" href="#nav-researchTrends"><span><i class="fa fa-fire"></i> Trend Finder</span></div><div id="nav-researchTrademarks-tab" class="nav-item pm_btn has-bg-icon" data-toggle="pill" href="#nav-researchTrademarks" style="margin-left:6px"><span><i class="fa fa-trademark"></i> Trademark Search</span></div></div></nav><div class="tab-content" style="padding: 25px 0"><div id="nav-researchTrends" class="tab-pane fade show active"><div class="analytics-section-title" style="margin-bottom: 14px;">Trend Finder<div class="subtitle" style="text-transform: none">Discover new and upcoming trends before they go mainstream</div></div>' + ("pro+" != G_PRO_PLAN ? '<div class="alert alert-warning" style="padding: 8px 12px; margin-bottom: 15px;">Free and Pro accounts have limited access to the Research features. <a href="" class="enter-licence" style="font-weight: bold">Upgrade to the PrettyMerch Pro+ plan</a> to unlock all Reseach features.</div>' : "") + '<div class="research-trends-filters-container clearfix"><div class="research-trends-filters-row clearfix" style="padding-top:0px; padding-bottom: 12px;"><div class="research-trends-filters-title">Keywords</div><div class="research-trends-filters-options clearfix"><div class="research-trends-search-query-container" style="display: inline-block"><input type="text" name="research-trends-search-query" placeholder="Enter keyword or ASIN (optional)" class="form-control" autocomplete="off" autofill="off" style="float: left; margin-right: 8px"><i class="fa fa-circle-o-notch fa-spin search-query-spinner"></i><div class="dropdown float-left"><div class="pm_btn dropdown-toggle" data-toggle="dropdown"><span class="dropdown-label">Exact Match</span></div><div class="pm_dropdown dropdown-menu research-trends-filter" data-filter-style="dropdown" data-filter="search_type"><div class="dropdown-item research-trends-filter-option is-default-filter active selected" data-value="PHRASE"><div class="title">Exact Match</div><div class="sub-text">Find ALL words in EXACT order</div></div><div class="dropdown-item research-trends-filter-option" data-value="DEFAULT"><div class="title">Close Match</div><div class="sub-text">Find ALL words in ANY order</div></div><div class="dropdown-item research-trends-filter-option" data-value="BROAD"><div class="title">Partial Match</div><div class="sub-text">Find ANY words in ANY order</div></div></div></div><div class="search-query-help"><span>ESC</span> to clear</div></div><div class="research-trends-filter clearfix" data-filter-style="single-select" data-filter="search_in"><div class="pm_btn_radio_container float-left clearfix" style="margin-right: 5px"><div class="pm_btn mb-0 research-trends-filter-option is-default-filter selected" data-available-to="free" data-value="title">Title Only</div> <div class="pm_btn mb-0 research-trends-filter-option" data-value="all">Title, Brand & Bullets</div> <div class="pm_btn mb-0 research-trends-filter-option" data-value="asin">ASIN</div> </div></div></div></div><div class="research-trends-filters-row clearfix"><div class="research-trends-filters-title">Marketplace</div><div class="research-trends-filters-options clearfix"><div class="research-trends-filter clearfix" data-filter-style="single-select" data-filter="marketplace"><div class="pm_btn has-bg-image research-trends-filter-option is-default-filter selected" data-value="COM" data-available-products="SHIRT,HOODIE,POPSOCKET,PHONE" data-available-to="free" style="background-image: url(' + chrome.extension.getURL("/assets/img/flag_USA_256_min.png") + ')">United States</div> <div class="pm_btn has-bg-image research-trends-filter-option" data-value="UK" data-available-products="SHIRT"  style="background-image: url(' + chrome.extension.getURL("/assets/img/flag_UK_256_min.png") + ')">United Kingdom</div> <div class="pm_btn has-bg-image research-trends-filter-option" data-value="DE" data-available-products="SHIRT,HOODIE" style="background-image: url(' + chrome.extension.getURL("/assets/img/flag_DE_256_min.png") + ')">Germany</div> <div class="pm_btn has-bg-image research-trends-filter-option" data-value="FR" data-available-products="SHIRT,HOODIE" style="background-image: url(' + chrome.extension.getURL("/assets/img/flag_FR_256_min.png") + ')">France</div> <div class="pm_btn has-bg-image research-trends-filter-option" data-value="IT" data-available-products="SHIRT,HOODIE" style="background-image: url(' + chrome.extension.getURL("/assets/img/flag_IT_256_min.png") + ')">Italy</div> <div class="pm_btn has-bg-image research-trends-filter-option" data-value="ES" data-available-products="SHIRT,HOODIE" style="background-image: url(' + chrome.extension.getURL("/assets/img/flag_ES_256_min.png") + ')">Spain</div> <div class="pm_btn has-bg-image research-trends-filter-option" data-value="JP" data-available-products="SHIRT,HOODIE" style="background-image: url(' + chrome.extension.getURL("/assets/img/flag_JP_256_min.png") + ')">Japan</div> </div></div></div><div class="research-trends-filters-row clearfix"><div class="research-trends-filters-title">Product</div><div class="research-trends-filters-options clearfix"><div class="research-trends-filter clearfix" data-filter-style="single-select" data-filter="product"><div class="pm_btn research-trends-filter-option is-default-filter selected" data-available-to="free" data-value="SHIRT">T-Shirts</div><div class="pm_btn research-trends-filter-option" data-value="HOODIE">Pullover Hoodies</div><div class="pm_btn research-trends-filter-option" data-value="POPSOCKET">PopSockets</div><div class="pm_btn research-trends-filter-option" data-value="PHONE">Phone Cases</div></div></div></div><div class="research-trends-filters-row clearfix" style="padding-bottom: 12px"><div class="research-trends-filters-title">Sort By</div><div class="research-trends-filters-options clearfix"><div class="research-trends-filter clearfix" data-filter-style="single-select" data-filter="sort_by" style="display: inline-block"><div class="pm_btn research-trends-filter-option is-default-filter selected" data-value="bsr" data-default-order="ASC" data-order-description="Lowest to Highest, Highest to Lowest">BSR<i class="fa fa-info-circle help-icon" data-toggle="custom-tooltip" data-html="true" title="<span>Sort results by:<br/>➡ Their current BSR value.<br/>Lower BSR means more sales</span>"></i></div><div class="pm_btn research-trends-filter-option" data-value="sales" data-default-order="DESC" data-order-description="Least to Most, Most to Least">Sales<i class="fa fa-info-circle help-icon" data-toggle="custom-tooltip" data-html="true" title="<span>Sort results by:<br/>➡ Their estimated monthly sales.</span>"></i></div><div class="pm_btn research-trends-filter-option" data-value="boost" data-default-order="ASC" data-order-description="Highest to Lowest, Lowest to Highest">BSR Change<i class="fa fa-info-circle help-icon" data-toggle="custom-tooltip" data-html="true" title="<span>Sort results by:<br/>➡ The change in their BSR over the last 24 hours. Products with a significant decrease in BSR have started picking up sales</span>"></i></div><div class="pm_btn research-trends-filter-option" data-value="avg7bsr" data-default-order="ASC" data-order-description="Lowest to Highest, Highest to Lowest">7D Avg BSR<i class="fa fa-info-circle help-icon" data-toggle="custom-tooltip" data-html="true" title="<span>Sort results by:<br/>➡ Their average BSR over the last 7 days.<br/>Products with low 7 day BSRs are usually trending</span>"></i></div><div class="pm_btn research-trends-filter-option" data-value="avg30bsr" data-default-order="ASC" data-order-description="Lowest to Highest, Highest to Lowest">30D Avg BSR<i class="fa fa-info-circle help-icon" data-toggle="custom-tooltip" data-html="true" title="<span>Sort results by:<br/>➡ Their average BSR over the last 30 days.<br/>Products with low 30 day BSRs are more consistent sellers</span>"></i></div><div class="pm_btn research-trends-filter-option" data-value="reviews" data-default-order="DESC" data-order-description="Least to Most, Most to Least">No of Reviews<i class="fa fa-info-circle help-icon" data-toggle="custom-tooltip" data-html="true" title="<span>Sort results by:<br/>➡ Their number of reviews.<br/>Products with a high number of reviews are usually evergreen and have consistent sales over time</span>"></i></div><div class="pm_btn research-trends-filter-option" data-value="reviewCount" data-default-order="DESC" data-order-description="Lowest to Highest, Highest to Lowest">Rating<i class="fa fa-info-circle help-icon" data-toggle="custom-tooltip" data-html="true" title="<span>Sort results by:<br/>➡ Their star rating out of 5</span>"></i></div><div class="pm_btn research-trends-filter-option" data-value="firstDate" data-default-order="DESC" data-order-description="Oldest to Newest, Newest to Oldest" data-available-to="free">Date Uploaded<i class="fa fa-info-circle help-icon" data-toggle="custom-tooltip" data-html="true" title="<span>Sort results by:<br/>➡ The date that they were uploaded to Amazon. This helps you find newly added products which have already started selling</span>"></i></div></div><div class="dropdown clearfix"><div class="pm_btn dropdown-toggle" data-toggle="dropdown"><span class="dropdown-label">Lowest to Highest</span></div><div class="pm_dropdown dropdown-menu research-trends-filter" data-filter-style="dropdown" data-filter="sort_direction"><div class="dropdown-item research-trends-filter-option is-default-filter active selected" data-value="ASC"><div class="title">Lowest to Highest</div></div><div class="dropdown-item research-trends-filter-option" data-value="DESC"><div class="title">Highest to Lowest</div></div></div></div></div></div><div class="research-trends-filters-row clearfix"><div class="research-trends-filters-title">BSR Range</div><div class="research-trends-filters-options clearfix"><div class="research-trends-filter float-left clearfix" data-filter-style="single-select" data-filter="bsr_range" style="padding: 0 10px; min-height: 36px; margin-right: 16px"><input id="trends_bsr_range" type="text" class="" style="width: 550px;" value="" data-slider-min="0" data-slider-max="10000000" data-slider-step="10000" data-slider-value="[0,1000000]" data-slider-ticks-snap-bounds="5000" data-slider-ticks="[0, 1000000, 10000000]"  /></div><div class="research-trends-filter trends_bsr_range_text float-left clearfix" style=""><span>1</span> - <span>1,000,000</span></div></div></div><div class="collapse" id="collapse_trend_filters"><div class="research-trends-filters-row clearfix"><div class="research-trends-filters-title pt-0">Show Official<br/>Brands</div><div class="research-trends-filters-options clearfix"><div class="research-trends-filter clearfix" data-filter-style="single-select" data-filter="official_brands"><div class="pm_btn research-trends-filter-option" data-value="yes" data-available-to="free">Yes</div> <div class="pm_btn research-trends-filter-option is-default-filter selected" data-value="no">No</div> </div></div></div><div class="research-trends-filters-row clearfix"><div class="research-trends-filters-title pt-0">Show Deleted<br/>Products</div><div class="research-trends-filters-options clearfix"><div class="research-trends-filter clearfix" data-filter-style="single-select" data-filter="deleted_products"><div class="pm_btn research-trends-filter-option" data-value="yes">Yes</div> <div class="pm_btn research-trends-filter-option is-default-filter selected" data-value="no" data-available-to="free">No</div> </div></div></div></div><div class="research-trends-filters-row clearfix" style="position: relative; border: none; padding-bottom: 0;"><div class="research-trends-filters-title">&nbsp;</div><div class="research-trends-filters-options clearfix"><div class="btn btn-sm btn-primary float-left has-bg-icon research-trends-apply_filters" style="width:130px; margin-right: 8px;"><i class="fa fa-search"></i>SEARCH</div> <div class="pm_btn research-trends-clear_filters" data-toggle="tooltip" data-title="Reset Filters" style="height: 31px"><i class="fa fa-eraser"></i></div> <div class="pm_btn has-bg-icon research-trends-collapse_filters" data-toggle="collapse" href="#collapse_trend_filters"><i class="fa fa-chevron-down"></i>More Filters</div> <div class="pm_btn has-bg-icon search-progress-container"><div><i class="fa fa-circle-o-notch fa-spin"></i>Searching</div></div> </div></div></div><div id="trends_results" style="position: relative"><div class="analytics_placeholder">Select filters and click Search</div><div class="product-thumbnail-container_toolbar pm_toolbar clearfix" style="margin-bottom: 20px"><div class="view-type-selector pm_btn_radio_container float-right clearfix" style=""><div class="pm_btn" data-view="grid"><i class="fa fa-th-large" style="line-height: 18px; margin-right: 4px"></i> Grid</div> <div class="pm_btn" data-view="list"><i class="fa fa-th-list" style="line-height: 18px; margin-right: 4px"></i> List</div> </div></div><div class="product-thumbnail-container details-view hidden" data-searchid="1"></div><div class="table_load_more_line hidden">Click to load more results...</div><div class="research_results_non_pro_plus hidden" style="text-align: center"><div class="alert alert-warning text-center" style="padding: 8px 12px; margin: 15px 0;">Free and Pro accounts are limited to 6 results. <a href="" class="enter-licence" style="font-weight: bold">Upgrade to the PrettyMerch Pro+ plan</a> to unlock <b>unlimited search results</b></div><img src="' + chrome.extension.getURL("/assets/img/research_blur.jpg") + '" width="991px" /></div><div class="endOfResults hidden">End of search results</div></div></div><div id="nav-researchTrademarks" class="tab-pane fade"><div class="analytics-section-title" style="margin-bottom: 14px;">Trademark Search<div class="subtitle" style="text-transform: none">Search for Tradmarks in any Marketplace</div></div>' + ("pro+" != G_PRO_PLAN ? '<div class="alert alert-warning" style="padding: 8px 12px; margin-bottom: 15px;">Free and Pro accounts have limited access to the Trademark Search features. <a href="" class="enter-licence" style="font-weight: bold">Upgrade to the PrettyMerch Pro+ plan</a> to unlock all Trademark features.</div>' : "") + '<div class="research-trademark-filters-container clearfix"><div class="research-trademark-filters-row clearfix" style="padding-top:0px; padding-bottom: 12px;"><div class="research-trademark-filters-title">Keywords</div><div class="research-trademark-filters-options clearfix"><div class="research-trademark-search-query-container" style="display: inline-block"><input type="text" name="research-trademark-search-query" placeholder="Enter keyword or phrase" class="form-control" autocomplete="off" autofill="off" style="float: left; margin-right: 8px; margin-bottom:0px"><i class="fa fa-circle-o-notch fa-spin search-query-spinner"></i><div class="dropdown float-left"><div class="pm_btn dropdown-toggle" data-toggle="dropdown"><span class="dropdown-label">Exact Match</span></div><div class="pm_dropdown dropdown-menu research-trademark-filter" data-filter-style="dropdown" data-filter="search_type"><div class="dropdown-item research-trademark-filter-option is-default-filter active selected" data-available-to="free" data-value="PHRASE"><div class="title">Exact Match</div><div class="sub-text">Find ALL words in EXACT order</div></div><div class="dropdown-item research-trademark-filter-option" data-value="DEFAULT"><div class="title">Close Match</div><div class="sub-text">Find ALL words in ANY order</div></div><div class="dropdown-item research-trademark-filter-option" data-value="BROAD"><div class="title">Partial Match</div><div class="sub-text">Find ANY words in ANY order</div></div></div></div><div class="search-query-help"><span>ESC</span> to clear</div></div><div class="checkbox-container clearfix"><input type="checkbox" class="" id="match-whole-words-checkbox" checked/><label style="position:relative" class="" for="match-whole-words-checkbox">Match Whole Words</label><i class="fa fa-info-circle help-icon" data-toggle="custom-tooltip" data-html="true" title="Match whole words (Selected)<br/><span>Keyword POWER will only show results where one of the words is POWER</span><br/><br/>Match whole words (NOT Selected)<br/><span>Keyword POWER will also show results such as POWERED and POWERFUL</span>"></i></div></div></div><div class="research-trademark-filters-row clearfix"><div class="research-trademark-filters-title">Marketplace</div><div class="research-trademark-filters-options clearfix"><div class="research-trademark-filter clearfix" data-filter-style="single-select" data-filter="marketplace"><div class="research-trademark-filter-options-all_column clearfix"><div class="pm_btn has-bg-icon research-trademark-filter-option is-all-filter is-default-filter selected" data-available-to="free" data-value="ALL"><i class="fa fa-globe"></i>All</div> </div><div class="research-trademark-filter-options-options_column clearfix"><div class="pm_btn has-bg-image research-trademark-filter-option" data-value="COM" style="background-image: url(' + chrome.extension.getURL("/assets/img/flag_USA_256_min.png") + ')">United States<i class="fa fa-info-circle help-icon" data-toggle="custom-tooltip" data-html="true" title="Search In:<br/><span>✔ United States Patent and TM Office</span><br/><span>✔ World IP Organization</span>"></i></div> <div class="pm_btn has-bg-image research-trademark-filter-option" data-value="UK" style="background-image: url(' + chrome.extension.getURL("/assets/img/flag_UK_256_min.png") + ')">United Kingdom<i class="fa fa-info-circle help-icon" data-toggle="custom-tooltip" data-html="true" title="Search In:<br/><span>✔ UK Intellectual Property Office</span><br><span>✔ European Union IP Office</span><br/><span>✔ World IP Organization</span>"></i></div> <div class="pm_btn has-bg-image research-trademark-filter-option" data-value="DE" style="background-image: url(' + chrome.extension.getURL("/assets/img/flag_DE_256_min.png") + ')">Germany<i class="fa fa-info-circle help-icon" data-toggle="custom-tooltip" data-html="true" title="Search In:<br/><span>✔ Deutsches Patent und Markenamt</span><br><span>✔ European Union IP Office</span><br/><span>✔ World IP Organization</span>"></i></div> <div class="pm_btn has-bg-image research-trademark-filter-option" data-value="FR" style="background-image: url(' + chrome.extension.getURL("/assets/img/flag_FR_256_min.png") + ')">France<i class="fa fa-info-circle help-icon" data-toggle="custom-tooltip" data-html="true" title="Search In:<br/><span>✔ Institut National de la Propriété Indust.</span><br><span>✔ European Union IP Office</span><br/><span>✔ World IP Organization</span>"></i></div> <div class="pm_btn has-bg-image research-trademark-filter-option" data-value="IT" style="background-image: url(' + chrome.extension.getURL("/assets/img/flag_IT_256_min.png") + ')">Italy<i class="fa fa-info-circle help-icon" data-toggle="custom-tooltip" data-html="true" title="Search In:<br/><span>✔ Italian Patent and Trademark Office</span><br><span>✔ European Union IP Office</span><br/><span>✔ World IP Organization</span>"></i></div> <div class="pm_btn has-bg-image research-trademark-filter-option" data-value="ES" style="background-image: url(' + chrome.extension.getURL("/assets/img/flag_ES_256_min.png") + ')">Spain<i class="fa fa-info-circle help-icon" data-toggle="custom-tooltip" data-html="true" title="Search In:<br/><span>✔ Oficina Española de Patentes y Marcas</span><br><span>✔ European Union IP Office</span><br/><span>✔ World IP Organization</span>"></i></div> </div></div></div></div><div class="research-trademark-filters-row clearfix"><div class="research-trademark-filters-title">Product (Nice Class)</div><div class="research-trademark-filters-options clearfix"><div class="research-trademark-filter clearfix" data-filter-style="single-select" data-filter="nice"><div class="research-trademark-filter-options-all_column clearfix"><div class="pm_btn has-bg-icon research-trademark-filter-option is-all-filter is-default-filter selected" data-available-to="free" data-value="ALL"><i class="fa fa-shopping-bag"></i>All</div> </div><div class="research-trademark-filter-options-options_column clearfix"><div class="pm_btn research-trademark-filter-option" data-value="25">T-Shirts (25)</div><div class="pm_btn research-trademark-filter-option" data-value="9">PopSockets (9)</div><div class="pm_btn research-trademark-filter-option" data-value="20">Pillow Cases (20)</div><div class="pm_btn research-trademark-filter-option" data-value="18">Tote Bags (18)</div></div></div></div></div><div class="research-trademark-filters-row clearfix"><div class="research-trademark-filters-title">Status</div><div class="research-trademark-filters-options clearfix"><div class="research-trademark-filter clearfix" data-filter-style="single-select" data-filter="status"><div class="research-trademark-filter-options-all_column clearfix"><div class="pm_btn has-bg-icon research-trademark-filter-option is-all-filter is-default-filter selected" data-available-to="free" data-value="all"><i class="fa fa-certificate"></i>All</div> </div><div class="research-trademark-filter-options-options_column clearfix"><div class="pm_btn research-trademark-filter-option" data-value="registered">Registered</div><div class="pm_btn research-trademark-filter-option" data-value="filed">Filed</div></div></div></div></div><div class="research-trademark-filters-row clearfix" style="position: relative; border: none; padding-bottom: 0;"><div class="research-trademark-filters-title">&nbsp;</div><div class="research-trademark-filters-options clearfix"><div class="btn btn-sm btn-primary float-left has-bg-icon research-trademark-apply_filters" style="width:130px; margin-right: 8px;"><i class="fa fa-search"></i>SEARCH</div> <div class="pm_btn research-trademark-clear_filters" data-toggle="tooltip" data-title="Reset Filters" style="height: 31px"><i class="fa fa-eraser"></i></div> <div class="pm_btn has-bg-icon search-progress-container"><div><i class="fa fa-circle-o-notch fa-spin"></i>Searching</div></div> </div></div></div><div id="trademark_results" style="position: relative"><div class="analytics_placeholder">Select filters and click Search</div><div class="trademark-table-container hidden"></div><div class="endOfResults hidden">End of search results</div></div></div></div></div></div></div>' + P + "</div></div>" + u + v + b + y + w + M + k + C + '<div class="modal fade" id="chartModal" tabindex="-1"><div class="modal-dialog modal-lg"><div class="modal-content"><div class="modal-header"><span class="modal-title">Sales:</span><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button></div><div class="modal-body clearfix" style=""><div class="row chart-summary-container"><div class="col clearfix"><div class="chart-summary blue-container"><div class="chart-summary-title">Sales</div><div class="chart-summary-number"><span class="sales">0</span></div><div class="chart-summary-footer sold-cancelled" title="Sold - Cancelled">0 - 0</div></div><div class="chart-summary orange-container"><div class="chart-summary-title">Returns</div><div class="chart-summary-number returned">0</div></div><div class="chart-summary pink-container"><div class="chart-summary-title">Royalties</div><div class="chart-summary-number royalties"><span class="currency-symbol">$</span><span class="number">0</span><span class="decimal"></span></div><div class="chart-summary-footer" title="Total Revenue"><span class="currency-symbol">$</span><span class="revenue">0</span></div></div><div class="chart-summary"><div class="chart-summary-title">Royalties/Sale</div><div class="chart-summary-number royalties-per-sale"><span class="currency-symbol">$</span><span class="number">0</span><span class="decimal"></span></div></div><div class="chart-summary" style="float:right; margin-right:0"><div class="chart-summary-title text-center">Revenue Share</div><div class="chart-summary-number clearfix"><div class="" style="float: left; box-sizing: border-box; text-align: center; width: 120px;"><span class="your-share">0</span><span class="percent-symbol">%</span></div><div class="" style="float: left; box-sizing: border-box; text-align: center; width: 120px"><span class="amazons-share">0</span><span class="percent-symbol">%</span></div></div><div class="chart-summary-footer clearfix"><div class="" style="float: left; box-sizing: border-box; text-align: center; width: 120px;">You</div><div class="" style="float: left; box-sizing: border-box; text-align: center; width: 120px">Amazon</div></div></div></div></div><div class="chart_outer_container" style="position: relative; width: 968px; height: 475px; overflow-x: auto;"><div class="chart_container" style="position: relative; width: 100%; height: 100%;"><canvas id="sales_chart" data-display="monthly"></canvas></div></div></div></div></div></div>' + _ + '<div class="modal fade" id="generalMessageModal" tabindex="-1"><div class="modal-dialog modal-dialog-centered"><div class="modal-content"><div class="modal-header"><span class="modal-title"></span><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span></button></div><div class="modal-body clearfix"></div><div class="modal-footer"></div></div></div></div><div class="modal fade lazy-load-images-container" id="productListingModal" tabindex="-1"><div class="modal-dialog modal-lg"><div class="modal-content"><div class="modal-header"><div class="col"><span class="modal-title"><i class="fa fa-shield"></i>Product Analyzer <span class="last-updated hidden">(Last updated: Moments ago)</span></span></div><div class="col-auto"><a href="" target="_blank" class="pm_btn view-on-amz disabled">View on Amazon</a><button type="button" class="close" data-dismiss="modal"><span>&times;</span></button></div></div><div class="modal-body clearfix" style="min-height: 300px;"><div class="row"><div class="col"><div class="product-listing"></div></div></div></div><div class="modal-footer"><button type="button" class="btn btn-light" data-dismiss="modal">Close</button></div></div></div></div>';
                    if ($().add(O).appendTo("#prettydash-container"), G_IS_PRO && G_LICENCE_CANCELLED_AT && ($("#invalidLicenceMessage .title, #invalidLicenceMessage .buttons, #invalidLicenceMessage .message-icon").addClass("hidden"), $("#invalidLicenceMessage .alert").removeClass("alert-danger").addClass("alert-warning"), $("#invalidLicenceMessage .message").css("margin", "0").html("Your PrettyMerch Pro subscription has been cancelled and will end <b>" + G_LICENCE_MSG + "</b>"), $("#invalidLicenceMessage").removeClass("hidden")), !G_IS_PRO && G_LICENCE_MSG && (G_LICENCE_CANCELLED_AT ? ($("#invalidLicenceMessage .title").html("Your PrettyMerch Pro subscription has ended"), $("#invalidLicenceMessage .message").html(G_LICENCE + " - " + G_LICENCE_MSG)) : G_LICENCE_FAILED_AT ? ($("#invalidLicenceMessage .title").html("Your PrettyMerch Pro subscription has expired"), $("#invalidLicenceMessage .message").html(G_LICENCE + " - " + G_LICENCE_MSG), $("#invalidLicenceMessage .message").append("<br/><br/><p><b>Why did this happen?</b></p><p>This usually happens when your credit card expires or doesn't have enough funds, or if PayPal fails to make the payment</p><p><b>How do I fix it?</b></p><p>Click the <b>Renew My Subscription</b> button below to go to our Gumroad page and re-subscribe. If you subscribed using a discount code, please contact us at getprettymerch@gmail.com before you subscribe and we will apply the discount to your new subscription</p>")) : ($("#invalidLicenceMessage .title").html("Your PrettyMerch Pro licence could not be validated"), $("#invalidLicenceMessage .message").html(G_LICENCE + " - " + G_LICENCE_MSG), $("#invalidLicenceMessage .message").append("<br/><br/><p><b>Why did this happen?</b></p><p>This usually happens if your licence was entered incorrectly, or if the validation server is temporarily unavailable</p><p><b>How do I fix it?</b></p><p>In 5 minutes click the <b>Update Licence Key</b> button below and then just click <b>Save</b>. If that doesn't work, please contact us at getprettymerch@gmail.com so we can send you your correct licence key</p>")), $("#invalidLicenceMessage").removeClass("hidden")), void 0 !== t.welcomeMessage && "" != t.welcomeMessage && t.welcomeMessage.show_welcome_message) {
                        $("#welcomeMessage .title").html(t.welcomeMessage.title);
                        var E = t.welcomeMessage.message;
                        E += "Useful Links:<ul style='margin-top:8px'>", E += "<li style='color: #004085; margin-bottom: 5px'><i class='fa fa-android' style='width:16px;text-align:center;margin-right:5px;height:15px;color:#1775b5;'></i>Download <a href='https://bit.ly/pretty-android' target='_blank'>PrettyMerch for Android</a></li>", E += "<li style='color: #004085; margin-bottom: 5px'><i class='fa fa-apple' style='width:16px;text-align:center;margin-right:5px;height:15px;color:#1775b5;'></i>Download <a href='https://bit.ly/pretty-ios' target='_blank'>PrettyMerch for iOS</a></li>", E += "<li style='color: #004085; margin-bottom: 5px'><i class='fa fa-facebook' style='width:16px;text-align:center;margin-right:5px;height:15px;color:#1775b5;'></i>Join the <a href='https://bit.ly/pretty-fb-group' target='_blank'>PrettyMerch Facebook Group</a> to keep up to date with new releases and upcoming features</li>", E += "<li style='color: #004085; margin-bottom: 5px'><i class='fa fa-envelope-o' style='width:16px;text-align:center;margin-right:5px;height:15px;color:#1775b5;'></i>For questions/suggestions/comments/bugs - drop us a line at <b><a href='getprettymerch@gmail.com'>getprettymerch@gmail.com</a></b> - We read and reply to every email.</li>", E += "</ul>", $("#welcomeMessage .message").html(E), $("#welcomeMessage").removeClass("hidden")
                    }
                    if (void 0 !== t.updateAvailableMessage && "" != t.updateAvailableMessage && t.updateAvailableMessage.show_message && ($("#updatesAvailableAlert .title").html(t.updateAvailableMessage.title), $("#updatesAvailableAlert .message").html(t.updateAvailableMessage.message), $("#updatesAvailableAlert").removeClass("hidden")), void 0 !== t.updateMessage && "" != t.updateMessage && t.updateMessage.show_update) {
                        $("#updatesAlert .updatesContainer .title").html(t.updateMessage.title), $("#updatesAlert .updatesContainer .message").html(t.updateMessage.message);
                        var D = "";
                        if (t.updateMessage.free_list.length > 0) {
                            for (D = '<b>All versions</b>:<ul style="margin-top:8px">', x = 0; x < t.updateMessage.free_list.length; ++x) D += '<li style="color: #004085; margin-bottom: 5px">' + t.updateMessage.free_list[x] + "</li>";
                            D += "</ul>"
                        }
                        var A = "";
                        if (t.updateMessage.pro_list.length > 0) {
                            for (A = '<b>PrettyMerch PRO</b>:<ul style="margin-top:8px">', x = 0; x < t.updateMessage.pro_list.length; ++x) A += '<li style="color: #004085; margin-bottom: 5px">' + t.updateMessage.pro_list[x] + "</li>";
                            A += "</ul>"
                        }
                        'Useful Links:<ul style="margin-top:8px">', "<li style='color: #004085; margin-bottom: 5px'><i class='fa fa-star' style='width:16px;text-align:center;margin-right:5px;height:15px;color:#1775b5;'></i><b>Has PrettyMerch helped you in your Merch journey?</b> We would really appreciate it if you could spare 1 minute to <a href='https://bit.ly/pretty-review-extension' target='_blank'><b>leave us a review</b></a></li>", "<li style='color: #004085; margin-bottom: 5px'><i class='fa fa-bug' style='width:16px;text-align:center;margin-right:5px;height:15px;color:#1775b5;'></i>Please report any bugs to <b><a href='getprettymerch@gmail.com'>getprettymerch@gmail.com</a></b></li>", "</ul>", $("#updatesAlert .updatesContainer .list").html(D + A + "Useful Links:<ul style=\"margin-top:8px\"><li style='color: #004085; margin-bottom: 5px'><i class='fa fa-star' style='width:16px;text-align:center;margin-right:5px;height:15px;color:#1775b5;'></i><b>Has PrettyMerch helped you in your Merch journey?</b> We would really appreciate it if you could spare 1 minute to <a href='https://bit.ly/pretty-review-extension' target='_blank'><b>leave us a review</b></a></li><li style='color: #004085; margin-bottom: 5px'><i class='fa fa-bug' style='width:16px;text-align:center;margin-right:5px;height:15px;color:#1775b5;'></i>Please report any bugs to <b><a href='getprettymerch@gmail.com'>getprettymerch@gmail.com</a></b></li></ul>"), $("#updatesAlert").removeClass("hidden")
                    }
                    if ("pro+" != G_PRO_PLAN && void 0 !== t.specialOffers && "" != t.specialOffers) {
                        var I = jQuery.extend(!0, {}, t.specialOffers);
                        I.ads && Object.keys(I.ads).forEach((function(e) {
                            var t = moment().startOf("day").valueOf(),
                                a = moment(I.ads[e].start_date).startOf("day").valueOf(),
                                s = moment(I.ads[e].end_date).startOf("day").valueOf();
                            a <= t && s >= t && ($("#updatesAlert .upgradeToProContainer").addClass("hidden"), $("#specialOffersAlertBox").data("ad_id", e), $("#specialOffersAlertBox .specialOfferContent").html(I.ads[e].html), $("#specialOffersAlertBox").removeClass("hidden"))
                        }))
                    }
                    toggleLoaderDiv(".sales-summary.init-loader", "show"), toggleProgressBar(".last-seven-days-chart", "show", "Downloading Sales..."), toggleProgressBar(".sales-summary.all-time", "show", "Downloading Sales...");
                    var U = document.querySelector(".odometer");
                    null != U && (od = new Odometer({
                            el: U,
                            value: 0,
                            duration: 1500,
                            theme: "minimal"
                        })),
                        function() {
                            $('[data-toggle="tooltip"]').tooltip(), $('[data-toggle="popover"]').popover(), $(".show-beta").click((function() {
                                $("#nav-prettyResearch-tab").removeClass("hidden")
                            })), $(document).on("click", "a.disabled", (function(e) {
                                e.preventDefault()
                            })), $(document).on("click", "#nav-container .navigation .nav-link", (function() {
                                var e = "https://merch.amazon.com" + $(this).attr("href");
                                window.location.href = e
                            })), $(document).on("click", ".pm_nav .pm_btn", (function(e) {
                                var t = $(this);
                                t.parent(".pm_nav").first().find(".pm_btn").each((function() {
                                    $(this).removeClass("selected active")
                                })), t.addClass("selected active")
                            })), $(document).off("mouseup").on("mouseup", (function(e) {
                                _this = $(e.target), _this.parent().hasClass("dropdown-toggle") && (_this = _this.parent()), _this.hasClass("dropdown-toggle") && _this.next(".dropdown-menu").toggleClass("show"), $(".pm_btn.dropdown-toggle").each((function() {
                                    _this.is($(this)) || $(this).next(".dropdown-menu").removeClass("show")
                                }))
                            })), $(".show-logout-modal").click((function() {
                                $("#loggedOutMessage_modal").removeClass("hidden")
                            })), $(".show-tier-up-modal").click((function() {
                                showModal("#tierUpModal"), confetti("confetti-canvas", "start")
                            })), $(".close-tier-up-modal").click((function() {
                                confetti("confetti-canvas", "stop")
                            })), $(".trigger-check-for-sales").click((function() {
                                chrome.extension.sendMessage({
                                    manual_check_for_sales: !0
                                })
                            })), $(".trigger-do-misc-tasks").click((function() {
                                chrome.extension.sendMessage({
                                    trigger_do_misc_tasks: !0
                                })
                            })), $(".trigger-check-for-tier-up").click((function() {
                                chrome.extension.sendMessage({
                                    manual_check_for_tier_up: !0
                                })
                            })), $(".trigger-auto-login").click((function() {
                                chrome.extension.sendMessage({
                                    trigger_auto_login: !0
                                })
                            })), $(".test-check-login").click((function() {
                                chrome.extension.sendMessage({
                                    trigger_check_login: !0
                                })
                            })), $(".close_loggedOutMessage_modal").click((function() {
                                $("#loggedOutMessage_modal").addClass("hidden")
                            })), $(".update-extension-now").click((function() {
                                $(this).html("Updating...").prop("disabled", !0), showModal("#updateProgressModal"), setTimeout((function() {
                                    $("#updateProgressModal .progress-bar").css("width", "20%")
                                }), 1e3), setTimeout((function() {
                                    $("#updateProgressModal .progress-bar").css("width", "30%")
                                }), 2e3), setTimeout((function() {
                                    $("#updateProgressModal .progress-bar").css("width", "40%")
                                }), 3e3), setTimeout((function() {
                                    $("#updateProgressModal .progress-bar").css("width", "50%")
                                }), 4e3), setTimeout((function() {
                                    $("#updateProgressModal .progress-bar").css("width", "60%")
                                }), 5e3), setTimeout((function() {
                                    $("#updateProgressModal .progress-bar").css("width", "70%")
                                }), 6e3), setTimeout((function() {
                                    $("#updateProgressModal .progress-bar").css("width", "80%")
                                }), 7e3), setTimeout((function() {
                                    $("#updateProgressModal .progress-bar").css("width", "90%")
                                }), 8e3), setTimeout((function() {
                                    $("#updateProgressModal .progress-bar").css("width", "100%"), $("#updateProgressModal .progress-text").html("<b>All done, please reload the page</b>"), $("#updateProgressModal .reload-page").addClass("show")
                                }), 9e3), chrome.extension.sendMessage({
                                    update_extension_now: !0
                                })
                            })), $("#updateProgressModal .reload-page").click((function() {
                                window.location.reload()
                            })), $("a.logout-link").click((function() {
                                chrome.extension.sendMessage({
                                    user_logged_out: "true"
                                })
                            })), $(".clear-welcome-message").click((function() {
                                chrome.storage.sync.remove("welcomeMessage")
                            })), $(".clear-update-available").click((function() {
                                chrome.storage.sync.remove("updateAvailableMessage")
                            })), $(".clear-update").click((function() {
                                $("#updatesAlert").addClass("hidden"), chrome.storage.sync.remove("updateMessage")
                            })), $(".clear-special-offer").click((function() {
                                _this = $(this), _this.closest("#specialOffersAlertBox").addClass("hidden");
                                var e = _this.closest("#specialOffersAlertBox").data("ad_id");
                                chrome.storage.sync.get("specialOffers", (function(t) {
                                    if (void 0 !== t.specialOffers && "" != t.specialOffers) {
                                        var a = jQuery.extend(!0, {}, t.specialOffers);
                                        delete a.ads[e], chrome.storage.sync.remove("specialOffers", (function() {
                                            chrome.storage.sync.set({
                                                specialOffers: a
                                            }, (function() {}))
                                        }))
                                    }
                                }))
                            })), $(".refresh-all-time-no-cache").click((function() {
                                chrome.extension.sendMessage({
                                    refresh_all_time_no_cache: !0
                                })
                            })), $(".show-all-time-modal").click((function() {
                                showSalesChartModal()
                            })), $(".header-flag").click((function() {
                                _this = $(this), $(".header-flag").removeClass("active"), _this.addClass("active");
                                var e = {};
                                e[logged_in_user + "_selectedMarketplace"] = _this.data("marketplace"), chrome.storage.local.set(e, (function() {
                                    chrome.extension.sendMessage({
                                        initApp: "prettyDash"
                                    }), chrome.extension.sendMessage({
                                        getAllMarketplacesInfo: !0
                                    }, (function(e) {
                                        selected_marketplace = JSON.parse(JSON.stringify(e.allMarketplaces[_this.data("marketplace")]))
                                    }))
                                }))
                            }));
                            for (var e = new MutationObserver((function(e) {
                                    var t = "",
                                        a = !1;
                                    e.forEach((function(e) {
                                        e.target.classList.contains("trigger-lazy-load-images") && (t = jQuery.extend(!0, {}, e), a = !0)
                                    })), a && findContainersWithImagesToLoad($(t.target))
                                })), t = document.getElementsByClassName("trigger-lazy-load-images"), a = 0; a < t.length; a++) e.observe(t.item(a), {
                                attributes: !0
                            });

                            function s(e, t) {
                                t.find("tbody tr").length;
                                var a = t.find("tr.pm-selected-row").length;
                                a > 0 ? (e.find(".enable-when-rows-selected").removeClass("disabled"), e.find(".product-count").removeClass("hidden").html(a + " product" + (a > 1 ? "s" : "") + " selected")) : (e.find(".enable-when-rows-selected").addClass("disabled"), e.find(".product-count").addClass("hidden").html(""))
                            }

                            function i(e) {
                                var t = !0;
                                $("#optionsModal .is-invalid").each((function(e, t) {
                                    $(t).removeClass("is-invalid")
                                }));
                                var a = parseInt($(".options-form #input_taxRate").val());
                                (!l(a) || a < 0 || a > 100) && (t = !1, $(".options-form #input_taxRate").addClass("is-invalid")), $(".options-form #allow_autoReLogin").is(":checked") && ("" == $(".options-form #input_arl_email").val().trim() ? (t = !1, $(".options-form #input_arl_email + .invalid-feedback").html("Please enter a valid email"), $(".options-form #input_arl_email").addClass("is-invalid")) : btoa($(".options-form #input_arl_email").val().trim()) != logged_in_user && (t = !1, $(".options-form #input_arl_email + .invalid-feedback").html("This email does not match the email of the account"), $(".options-form #input_arl_email").addClass("is-invalid")), "" == $(".options-form #input_arl_password").val().trim() && (t = !1, $(".options-form #input_arl_password").addClass("is-invalid"))), "function" == typeof e && e(t)
                            }

                            function l(e) {
                                return !isNaN(e) && parseInt(Number(e)) == e && !isNaN(parseInt(e, 10))
                            }
                            $(document).on("click", ".edit-product", (function(e) {
                                var t = $(this),
                                    a = t.closest("tr");
                                if (t.hasClass("disabled") || t.hasClass("disabled-until-list-is-ready"));
                                else {
                                    t.find("i").removeClass().addClass("fa fa-circle-o-notch fa-spin");
                                    var s = [],
                                        i = {
                                            id: a.data("merchandiseid"),
                                            asin: a.data("asin"),
                                            identifier: a.data("identifier"),
                                            keywords: a.data("keywords"),
                                            marketplace: a.data("marketplace"),
                                            product_type: a.data("producttype")
                                        };
                                    s.push(i), chrome.extension.sendMessage({
                                        createEditProductTab: !0,
                                        merchandise_list: s
                                    })
                                }
                            })), $(document).on("click", ".batch-edit-products", (function(e) {
                                var t = $(this),
                                    a = $(this).closest(".pm_toolbar").data("target-table"),
                                    s = $(a).find("tr.pm-selected-row"),
                                    i = $(a).find("tr.pm-selected-row .btn.edit-product"),
                                    l = [];
                                if (t.hasClass("disabled") || t.hasClass("disabled-until-list-is-ready"));
                                else if (i.length >= 10) {
                                    var r = $("#generalMessageModal"),
                                        o = "<p><b>You are about to open " + i.length + " new tabs.</b></p><p>Are you sure you want to continue?</p>",
                                        d = "<div class='btn btn-primary continue_open_tabs'>Continue</div><div class='btn btn-light cancel_open_tabs'>Cancel</div>";
                                    r.find(".modal-title").text("Warning"), r.find(".modal-body").html(o), r.find(".modal-footer").html(d), r.modal({
                                        backdrop: "static",
                                        keyboard: !1
                                    }), $(document).off("click", "#generalMessageModal .continue_open_tabs").on("click", "#generalMessageModal .continue_open_tabs", (function() {
                                        r.modal("hide"), n()
                                    })), $(document).off("click", "#generalMessageModal .cancel_open_tabs").on("click", "#generalMessageModal .cancel_open_tabs", (function() {
                                        r.modal("hide")
                                    }))
                                } else n();

                                function n() {
                                    s.each((function() {
                                        if ($(this).find(".btn.edit-product i").length > 0) {
                                            $(this).find(".btn.edit-product i").removeClass().addClass("fa fa-circle-o-notch fa-spin");
                                            var e = {
                                                id: $(this).data("merchandiseid"),
                                                asin: $(this).data("asin"),
                                                identifier: $(this).data("identifier"),
                                                keywords: $(this).data("keywords"),
                                                marketplace: $(this).data("marketplace"),
                                                product_type: $(this).data("producttype")
                                            };
                                            l.push(e)
                                        }
                                    })), l.length > 0 && chrome.extension.sendMessage({
                                        createEditProductTab: !0,
                                        merchandise_list: l
                                    })
                                }
                            })), $(document).on("click", ".delete-product, .batch-delete-products", (function(e) {
                                var t = $(this),
                                    a = {},
                                    s = [],
                                    i = [];
                                t.hasClass("batch-delete-products") ? (a = t.closest(".pm_toolbar").data("target-table"), s = $(a).find("tr.pm-selected-row[data-is_deletable=true]"), i = $(a).find("tr.pm-selected-row[data-status=published]")) : (s = t.closest("tr[data-is_deletable=true]"), i = t.closest("tr[data-status=published]"));
                                var l = parseInt(9 * Math.random() + 1),
                                    r = parseInt(9 * Math.random() + 1),
                                    o = l + r,
                                    d = [];
                                if (t.hasClass("disabled") || t.hasClass("disabled-until-list-is-ready"));
                                else if (s.length > 0) {
                                    var n = $("#generalMessageModal"),
                                        c = '<div style="text-align: center; margin-bottom: 30px"><img style="height: 75px" src="' + chrome.extension.getURL("/assets/img/warning-img.png") + "\"></div><div><p style='font-size: 22px'><b>Are you sure you want to DELETE " + s.length + " product" + (1 == s.length ? "" : "s") + "?</b></p><p>This action cannot be undone.</p>",
                                        p = "<div class='btn btn-danger continue_delete_products'>Delete " + s.length + " product" + (1 == s.length ? "" : "s") + "</div><div class='btn btn-light cancel_delete_products'>Cancel</div>";
                                    i.length > 0 && (c += '<div class="alert alert-warning" style="padding: 8px 12px; margin-top: 22px; font-size: 16px"><div style="margin-bottom: 8px"><b>' + i.length + " of the products selected " + (1 == i.length ? "is" : "are") + ' LIVE</b></div>Please enter the answer below to confirm that you want to <span style="text-decoration: underline">delete live products</span><div style="height: 38px; line-height: 36px; margin-top: 8px; font-weight: bold;">' + l + " + " + r + ' = <input type="text" class="form-control text-center input_check_sum" style="display: inline-block; width: 100px; margin-left: 6px; font-weight: bold" data-lpignore="true"><div class="invalid-feedback">Wrong answer, please try again</div></div></div>'), n.find(".modal-title").text("CONFIRM DELETE"), n.find(".modal-body").html(c), n.find(".modal-footer").html(p), n.modal({
                                        backdrop: "static",
                                        keyboard: !1
                                    }), $(document).off("click", "#generalMessageModal .continue_delete_products").on("click", "#generalMessageModal .continue_delete_products", (function() {
                                        i.length > 0 ? $(document).find("#generalMessageModal .input_check_sum").first().val() == o ? e() : $(document).find("#generalMessageModal .input_check_sum").first().addClass("is-invalid") : e();

                                        function e() {
                                            m()
                                        }
                                    })), $(document).off("click", "#generalMessageModal .cancel_delete_products").on("click", "#generalMessageModal .cancel_delete_products", (function() {
                                        n.modal("hide")
                                    }))
                                }

                                function m() {
                                    s.each((function() {
                                        $(this).find(".btn.delete-product i").length > 0 && $(this).find(".btn.delete-product i").removeClass().addClass("fa fa-circle-o-notch fa-spin");
                                        var e = {
                                            id: $(this).data("merchandiseid"),
                                            asin: $(this).data("asin"),
                                            identifier: $(this).data("identifier"),
                                            keywords: $(this).data("keywords"),
                                            marketplace: $(this).data("marketplace"),
                                            product_type: $(this).data("producttype")
                                        };
                                        d.push(e)
                                    })), d.length > 0 && chrome.extension.sendMessage({
                                        deleteProductsFromAmazon: !0,
                                        merchandise_list: d,
                                        progress_container: "#generalMessageModal .modal-content"
                                    })
                                }
                            })), $(document).on("change", "table.with-checkbox .pm-checkbox .select-row", (function(e) {
                                var t = $(this),
                                    a = $(this).closest("tr"),
                                    i = a.closest("table"),
                                    l = $(i.data("toolbar"));
                                t.is(":checked") ? a.addClass("pm-selected-row") : a.removeClass("pm-selected-row"), s(l, i)
                            })), $(document).on("click", ".pm_select_all_rows, .pm_unselect_all_rows", (function(e) {
                                var t = $(this),
                                    a = $(this).closest(".pm_toolbar"),
                                    i = t.hasClass("pm_select_all_rows") ? "select" : "unselect",
                                    l = $(this).closest(".pm_toolbar").data("target-table");
                                $(l).find(".pm-checkbox .select-row").each((function() {
                                    var e = $(this).closest("tr");
                                    "select" == i ? e.hasClass("disabled-row") || ($(this).prop("checked", !0), e.addClass("pm-selected-row")) : ($(this).prop("checked", !1), e.removeClass("pm-selected-row"))
                                })), s($(a), $(l))
                            })), $(".show-sales-modal").click((function() {
                                if (_this = $(this), G_IS_PRO) {
                                    var e = _this.data("period"),
                                        t = 0,
                                        a = 0,
                                        s = "#salesModal .shirt-list";
                                    "custom" == e && (t = _this.data("startDate"), a = _this.data("endDate")), showSalesModal(e, t, a, s)
                                } else showAvailableInProMessage("summary_click")
                            })), $(document).on("change", ".hide-titles", (function() {
                                selectedInput = $(this), selectedInput.is(":checked") ? ($(".hide-in-screenshot").addClass("blur-contents"), $(".hide-in-screenshot").closest("tr").find('[data-toggle="popover"]').popover("disable")) : ($(".hide-in-screenshot").removeClass("blur-contents"), $(".hide-in-screenshot").closest("tr").find('[data-toggle="popover"]').popover("enable")), $(".hide-titles").each((function(e, t) {
                                    $(t).prop("checked", selectedInput.is(":checked"))
                                }))
                            })), $(document).on("click", ".trigger-options-modal", (function(e) {
                                e.preventDefault(), $("#optionsModal .is-invalid").each((function(e, t) {
                                    $(t).removeClass("is-invalid")
                                }));
                                var t = {
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
                                    },
                                    a = logged_in_user + "_options";
                                chrome.storage.sync.get(a, (function(e) {
                                    void 0 !== e[a] && (t = {
                                        show_sales_notif: e[a].hasOwnProperty("show_sales_notif") ? e[a].show_sales_notif : t.show_sales_notif,
                                        sales_notif_sound: e[a].sales_notif_sound || t.sales_notif_sound,
                                        show_logout_notif: e[a].hasOwnProperty("show_logout_notif") ? e[a].show_logout_notif : t.show_logout_notif,
                                        logout_notif_sound: e[a].logout_notif_sound || t.logout_notif_sound,
                                        tax_rate: e[a].tax_rate || t.tax_rate,
                                        auto_re_login: e[a].auto_re_login ? {
                                            is_enabled: !!G_IS_PRO && (e[a].auto_re_login.is_enabled || t.auto_re_login.is_enabled),
                                            arl_email: e[a].auto_re_login.arl_email ? atob(e[a].auto_re_login.arl_email) : t.auto_re_login.arl_email,
                                            arl_password: e[a].auto_re_login.arl_password ? atob(e[a].auto_re_login.arl_password) : t.auto_re_login.arl_password
                                        } : t.auto_re_login
                                    }), $(".options-form #salesNotif").prop("checked", t.show_sales_notif), $(".options-form input[name=saleSound][value=" + t.sales_notif_sound + "]").prop("checked", !0), t.show_sales_notif || $(".saleSound-options input").each((function(e) {
                                        $(this).prop("disabled", !0)
                                    })), $(".options-form #logoutNotif").prop("checked", t.show_logout_notif), $(".options-form input[name=logoutSound][value=" + t.logout_notif_sound + "]").prop("checked", !0), t.show_logout_notif || $(".logoutSound-options input").each((function(e) {
                                        $(this).prop("disabled", !0)
                                    })), $(".options-form #input_taxRate").val(t.tax_rate), G_IS_PRO || $(".options-form #allow_autoReLogin").prop("disabled", !0), $(".options-form #allow_autoReLogin").prop("checked", t.auto_re_login.is_enabled), $(".options-form #input_arl_email").val(t.auto_re_login.arl_email), $(".options-form #input_arl_password").val(t.auto_re_login.arl_password), t.auto_re_login.is_enabled || $(".options-form .autoReLogin-options input").each((function(e) {
                                        $(this).prop("disabled", !0)
                                    })), showModal("#optionsModal")
                                }))
                            })), $(document).on("change", ".options-form input", (function(e) {
                                selectedInput = $(this), "salesNotif" == selectedInput.attr("id") && (selectedInput.is(":checked") ? $(".saleSound-options input").each((function(e) {
                                    $(this).prop("disabled", !1)
                                })) : $(".saleSound-options input").each((function(e) {
                                    $(this).prop("disabled", !0)
                                }))), "logoutNotif" == selectedInput.attr("id") && (selectedInput.is(":checked") ? $(".logoutSound-options input").each((function(e) {
                                    $(this).prop("disabled", !1)
                                })) : $(".logoutSound-options input").each((function(e) {
                                    $(this).prop("disabled", !0)
                                }))), "allow_autoReLogin" == selectedInput.attr("id") && (selectedInput.is(":checked") ? $(".options-form .autoReLogin-options input").each((function(e) {
                                    $(this).prop("disabled", !1)
                                })) : $(".options-form .autoReLogin-options input").each((function(e) {
                                    $(this).prop("disabled", !0)
                                })))
                            })), $(document).on("click", "#saveOptions", (function(e) {
                                var t = $(this);
                                i((function(e) {
                                    if (e) {
                                        $("#optionsModal .is-invalid").each((function(e, t) {
                                            $(t).removeClass("is-invalid")
                                        }));
                                        var a = G_TAX_RATE != parseInt($(".options-form #input_taxRate").val());
                                        a ? t.html("Reloading page...").prop("disabled", !0) : t.html("Saving...").prop("disabled", !0);
                                        var s = {
                                            show_sales_notif: $(".options-form #salesNotif").is(":checked"),
                                            sales_notif_sound: $(".options-form input[name=saleSound]:checked").val(),
                                            show_logout_notif: $(".options-form #logoutNotif").is(":checked"),
                                            logout_notif_sound: $(".options-form input[name=logoutSound]:checked").val(),
                                            tax_rate: parseInt($(".options-form #input_taxRate").val()),
                                            auto_re_login: {
                                                is_enabled: $(".options-form #allow_autoReLogin").is(":checked"),
                                                arl_email: btoa($(".options-form #input_arl_email").val().trim()),
                                                arl_password: btoa($(".options-form #input_arl_password").val().trim())
                                            }
                                        };
                                        G_TAX_RATE = s.tax_rate, chrome.extension.sendMessage({
                                            saveOptions: !0,
                                            options: s
                                        }, (function(e) {
                                            a ? window.location.reload() : (t.html("Save").prop("disabled", !1), $("#optionsModal").modal("hide"))
                                        }))
                                    }
                                }))
                            })), $(document).on("click", ".options-form .play_sound", (function(e) {
                                this_sound = $(this).parent().find("input").val();
                                var t = document.createElement("audio");
                                t.src = chrome.extension.getURL("/assets/mp3/" + this_sound + ".mp3"), t.play()
                            })), $(document).on("click", ".enter-licence", (function(e) {
                                e.preventDefault(), G_LICENCE && $("#licenceModal .licenceKey").val(G_LICENCE), showModal("#licenceModal")
                            })), $("#licenceModal").on("shown.bs.modal", (function() {
                                $("#licenceModal .licenceKey").removeClass("is-invalid").focus()
                            })), $(document).on("click", ".delete-licence", (function(e) {
                                var t = logged_in_user + btoa("_licence");
                                chrome.storage.sync.remove(t)
                            })), $(".saveLicence").click((function() {
                                var e = $("#licenceModal"),
                                    t = $("#enterLicenceForm"),
                                    a = t.find(".licenceKey").val().trim();
                                if (a) {
                                    var s = $(this);
                                    s.html("Saving...").prop("disabled", !0), t.find("fieldset").prop("disabled", !0), t.find(".licenceKey").removeClass("is-invalid");
                                    var i = {
                                        usr: logged_in_user,
                                        licence: a
                                    };
                                    chrome.extension.sendMessage({
                                        validateLicenceInBg: !0,
                                        data: i
                                    }, (function(i) {
                                        if (i && i.isValid && i.pm_plan?.includes("pro")) {
                                            e.find(".purchaseLicence").addClass("hidden"), s.toggleClass("btn-success", "btn-primary").html("Success! Reloading page...");
                                            var l = logged_in_user + btoa("_licence"),
                                                r = {
                                                    ul: i.active_licence ? btoa(i.active_licence) : btoa(a),
                                                    iv: btoa(i.isValid),
                                                    pl: btoa(i.pm_plan),
                                                    cd: btoa(i.subscription_cancelled_at),
                                                    fd: btoa(i.subscription_failed_at),
                                                    lm: btoa(i.msg)
                                                };
                                            logged_in_user && (memopts = {}, memopts[l] = r, chrome.storage.sync.set(memopts, (function(e) {
                                                window.location.reload()
                                            })));
                                            var o = logged_in_user + btoa("_lastVerifyUser"),
                                                d = {
                                                    date: 0
                                                };
                                            memopts = {}, memopts[o] = d, chrome.storage.sync.set(memopts)
                                        } else s.html("Save Licence").prop("disabled", !1), t.find("fieldset").prop("disabled", !1), t.find(".invalid-feedback").html(i.msg ? i.msg : "Invalid licence"), t.find(".licenceKey").addClass("is-invalid")
                                    }))
                                } else t.find(".invalid-feedback").html("Please enter a valid licence or email"), t.find(".licenceKey").addClass("is-invalid")
                            })), $(document).on("click", ".add-new-products-btn .add-new-products-option", (function(e) {
                                _this = $(this);
                                var t = _this.data("num-tabs"),
                                    a = _this.parent(".add-new-products-btn").data("uploader");
                                chrome.extension.sendMessage({
                                    open_addNew_tabs: !0,
                                    uploader_type: a,
                                    num_tabs: t
                                })
                            })), Chart.plugins.register({
                                afterDatasetsDraw: function(e, t) {
                                    var a = e.ctx,
                                        s = !0;
                                    e.data.datasets.forEach((function(e, t) {
                                        e.label.includes("Sold") && !e.hidden && (s = !1)
                                    })), e.data.datasets.forEach((function(t, i) {
                                        var l = e.getDatasetMeta(i);
                                        l.hidden || t.hidden || t.hide_labels || !t.label.includes("Sold") && !s || l.data.forEach((function(e, s) {
                                            0 == t.data[s] ? a.fillStyle = "#b1b1b1" : a.fillStyle = t.label_color[s];
                                            var i = 16,
                                                l = "normal",
                                                r = "Lato";
                                            a.font = Chart.helpers.fontString(i, l, r);
                                            var o = "";
                                            o = t.label.includes("Royalties") ? t.currency_symbol + t.data[s].toString() : t.data[s].toString(), a.textAlign = "center", a.textBaseline = "middle";
                                            var d = 7,
                                                n = e.tooltipPosition();
                                            if (n.y <= i + d) var c = n.y + i / 2 + d;
                                            else c = n.y - i / 2 - d;
                                            a.fillText(o, n.x, c)
                                        }))
                                    }))
                                }
                            }), Chart.helpers.drawRoundedTopRectangle = function(e, t, a, s, i, l) {
                                e.beginPath(), e.moveTo(t + l, a), e.lineTo(t + s - l, a), e.quadraticCurveTo(t + s, a, t + s, a + l), e.lineTo(t + s, a + i), e.lineTo(t, a + i), e.lineTo(t, a + l), e.quadraticCurveTo(t, a, t + l, a), e.closePath()
                            }, Chart.elements.RoundedTopRectangle = Chart.elements.Rectangle.extend({
                                draw: function() {
                                    var e, t, a, s, i, l, r, o = this._chart.ctx,
                                        d = this._view,
                                        n = d.borderWidth;
                                    if (d.horizontal ? (e = d.base, t = d.x, a = d.y - d.height / 2, s = d.y + d.height / 2, i = t > e ? 1 : -1, l = 1, r = d.borderSkipped || "left") : (e = d.x - d.width / 2, t = d.x + d.width / 2, a = d.y, i = 1, l = (s = d.base) > a ? 1 : -1, r = d.borderSkipped || "bottom"), n) {
                                        var c = Math.min(Math.abs(e - t), Math.abs(a - s)),
                                            p = (n = n > c ? c : n) / 2,
                                            m = e + ("left" !== r ? p * i : 0),
                                            u = t + ("right" !== r ? -p * i : 0),
                                            v = a + ("top" !== r ? p * l : 0),
                                            f = s + ("bottom" !== r ? -p * l : 0);
                                        m !== u && (a = v, s = f), v !== f && (e = m, t = u)
                                    }
                                    var h = Math.abs(e - t),
                                        g = a,
                                        b = (a = g + h * (this._chart.config.options.barRoundness || .5) * .5) - g;
                                    o.beginPath(), o.fillStyle = d.backgroundColor, o.strokeStyle = d.borderColor, o.lineWidth = n, Chart.helpers.drawRoundedTopRectangle(o, e, a - b + 1, h, s - g, b), o.fill(), n && o.stroke(), a = g
                                }
                            }), Chart.defaults.roundedBar = Chart.helpers.clone(Chart.defaults.bar), Chart.controllers.roundedBar = Chart.controllers.bar.extend({
                                dataElementType: Chart.elements.RoundedTopRectangle
                            }), $(document).on("show.bs.modal", ".modal", (function(e) {
                                var t = 1040 + 10 * $(".modal:visible").length;
                                $(this).css("z-index", t), setTimeout((function() {
                                    $(".modal-backdrop").not(".modal-stack").css("z-index", t - 1).addClass("modal-stack")
                                }), 0)
                            })), $(document).on("hidden.bs.modal", ".modal", (function() {
                                $(".modal:visible").length && $(document.body).addClass("modal-open")
                            })), $("#nav-prettyAnalytics-tab").click((function() {
                                if (_this = $(this), _this.hasClass("initialised"));
                                else {
                                    var e = G_IS_PRO ? moment().subtract(7, "days") : moment();
                                    $(".datepicker-trigger").caleran({
                                        startDate: e,
                                        endDate: moment(),
                                        target: $(".caleran-datepicker"),
                                        format: "MM/DD/YYYY",
                                        calendarCount: 3,
                                        minDate: moment("2015-09-01"),
                                        maxDate: moment(),
                                        showHeader: !1,
                                        showFooter: !1,
                                        startOnMonday: !0,
                                        oneCalendarWidth: 248,
                                        autoAlign: !1,
                                        autoCloseOnSelect: !0,
                                        oninit: function(e) {
                                            $(".datepicker-trigger").removeClass("invalid-dates"), e.$elem.find(".start-date").text(e.config.startDate.format(e.config.format)), e.$elem.find(".end-date").text(e.config.endDate.format(e.config.format))
                                        },
                                        onafterselect: function(e, t, a) {
                                            G_IS_PRO || (e.config.startDate = moment(), e.config.endDate = moment(), t = moment(), a = moment()), $(".datepicker-trigger").removeClass("invalid-dates"), e.$elem.find(".start-date").text(t ? t.format(e.config.format) : ""), e.$elem.find(".end-date").text(a ? a.format(e.config.format) : "");
                                            var s = !1;
                                            $(".datepicker-container .quick-dateranges > div").removeClass("selected"), $(".datepicker-container .quick-dateranges > div:not(.qdr_custom)").each((function() {
                                                a && moment(t).format(e.config.format) == moment($(this).data("start")).format(e.config.format) && moment(a).format(e.config.format) == moment($(this).data("end")).format(e.config.format) && (s = !0, $(this).addClass("selected"))
                                            })), s || $(".datepicker-container .quick-dateranges .qdr_custom").addClass("selected")
                                        },
                                        ondraw: function(e) {
                                            $(".datepicker-trigger").removeClass("invalid-dates");
                                            var t = e.config.startDate,
                                                a = e.config.endDate;
                                            e.$elem.find(".start-date").text(t ? t.format(e.config.format) : ""), e.$elem.find(".end-date").text(a ? a.format(e.config.format) : "")
                                        },
                                        onafterhide: function(e) {
                                            var t = e.config.startDate,
                                                a = e.config.endDate;
                                            t && a || $(".datepicker-trigger").addClass("invalid-dates")
                                        }
                                    });
                                    var t = $(".datepicker-trigger").data("caleran"),
                                        a = [{
                                            title: "Today",
                                            start_date: moment(),
                                            end_date: moment(),
                                            css_class: "qdr_today"
                                        }, {
                                            title: "Yesterday",
                                            start_date: moment().subtract(1, "days"),
                                            end_date: moment().subtract(1, "days"),
                                            css_class: "qdr_yesterday"
                                        }, {
                                            title: "Last 7 Days",
                                            start_date: moment().subtract(7, "days"),
                                            end_date: moment(),
                                            css_class: "qdr_last_7_days"
                                        }, {
                                            title: "Last 14 Days",
                                            start_date: moment().subtract(13, "days"),
                                            end_date: moment(),
                                            css_class: "qdr_last_14_days"
                                        }, {
                                            title: "This Month",
                                            start_date: moment().startOf("month"),
                                            end_date: moment(),
                                            css_class: "qdr_last_this_month"
                                        }, {
                                            title: "Previous Month",
                                            start_date: moment().subtract(1, "month").startOf("month"),
                                            end_date: moment().subtract(1, "month").endOf("month"),
                                            css_class: "qdr_last_previous_month"
                                        }, {
                                            title: "Last 90 Days",
                                            start_date: moment().subtract(89, "days"),
                                            end_date: moment(),
                                            css_class: "qdr_last_90_days"
                                        }, {
                                            title: "Year to Date",
                                            start_date: moment().startOf("year"),
                                            end_date: moment(),
                                            css_class: "qdr_ytd"
                                        }, {
                                            title: "Previous Year",
                                            start_date: moment().subtract(1, "year").startOf("year"),
                                            end_date: moment().subtract(1, "year").endOf("year"),
                                            css_class: "qdr_previous_year"
                                        }, {
                                            title: "All Time",
                                            start_date: moment("2015-09-01"),
                                            end_date: moment(),
                                            css_class: "qdr_previous_year"
                                        }],
                                        s = $(".datepicker-container .quick-dateranges"),
                                        i = "";
                                    for (x = 0; x < a.length; ++x) i += '<div class="pm_btn ' + a[x].css_class + '" ', i += 'data-start="' + a[x].start_date + '" ', i += 'data-end="' + a[x].end_date + '">', i += a[x].title, i += "</div>";
                                    i += '<div class="pm_btn qdr_custom">Custom</div>', s.html(i), G_IS_PRO ? $(".datepicker-container .quick-dateranges .qdr_last_7_days").addClass("selected") : ($(".datepicker-container .quick-dateranges .qdr_today").addClass("selected"), $(".datepicker-container .quick-dateranges > div:not(.qdr_today)").each((function() {
                                        $(this).addClass("disabled")
                                    }))), $(document).on("click", ".datepicker-container .quick-dateranges > div", (function(e, a) {
                                        if (_this = $(e.target), _this.hasClass("disabled"));
                                        else if ($(".datepicker-container .quick-dateranges > div").each((function() {
                                                $(this).removeClass("selected")
                                            })), _this.addClass("selected"), $(this).hasClass("qdr_custom")) t.showDropdown();
                                        else {
                                            t.config.startDate.startOf("day").valueOf();
                                            var s = t.config.endDate.startOf("day").valueOf(),
                                                i = moment(_this.data("start")).startOf("day").valueOf(),
                                                l = moment(_this.data("end")).startOf("day").valueOf();
                                            i >= s ? (t.setEnd(l), t.setStart(i)) : (t.setStart(i), t.setEnd(l))
                                        }
                                    })), $(document).on("click", ".analytics-marketplace-filter .toggle-marketplace-filter", (function(e, t) {
                                        _this = $(e.target), _this.hasClass("selected") ? _this.removeClass("selected") : _this.addClass("selected")
                                    })), $("#submit-analytics").click((function() {
                                        G_IS_PRO || (t.setEnd(moment()), t.setStart(moment()), $(".datepicker-container .quick-dateranges > div").each((function() {
                                            $(this).removeClass("selected")
                                        })), $(".datepicker-container .quick-dateranges > div.qdr_today").addClass("selected"));
                                        var e = t.config.startDate,
                                            a = t.config.endDate;
                                        if (e && a) {
                                            toggleProgressBar(".analytics-results-containter", "show", "Downloading...");
                                            var s = {
                                                    start_date: e,
                                                    end_date: a
                                                },
                                                i = [];
                                            $(".analytics-marketplace-filter .toggle-marketplace-filter").each((function() {
                                                $(this).hasClass("selected") && i.push($(this).data("marketplace"))
                                            })), 0 == i.length && ($(".analytics-marketplace-filter .toggle-marketplace-filter[data-marketplace=usa]").addClass("selected"), i.push("usa")), chrome.extension.sendMessage({
                                                fetch_analytics: !0,
                                                dates: s,
                                                selected_marketplaces: i
                                            }, (function(e) {
                                                if (0 == e.salesSummary.grand_totals.total_sold && 0 == e.salesSummary.grand_totals.total_returned) $(".analytics_placeholder").html('There were no sales in the selected time period<div class="no-sales-kaomoji">¯\\_(ツ)_/¯</div>').removeClass("hidden"), $(".analytics-results-containter .analytics-section").addClass("hidden");
                                                else {
                                                    var t = jQuery.extend(!0, {}, e.salesSummary),
                                                        a = t.summary_details.is_all_time,
                                                        s = {},
                                                        i = 0,
                                                        l = 0,
                                                        r = "analytics_sales_chart",
                                                        o = $("#" + r).closest(".analytics_chart_container"),
                                                        d = $(".analytics-results-containter"),
                                                        n = !1,
                                                        c = !1,
                                                        p = moment(t.summary_details.start_date).startOf("day"),
                                                        m = moment(t.summary_details.end_date).endOf("day"),
                                                        u = t.summary_details.days_duration,
                                                        v = t.summary_details.months_duration,
                                                        f = m.diff(p, "months", !0).toFixed(1);
                                                    u > 90 && ($(".analytics_chart .toggle_chart_layout").each((function() {
                                                        $(this).removeClass("selected")
                                                    })), $(".analytics_chart .toggle_chart_layout[data-layout=monthly]").addClass("selected"), $("#" + r).data("display", "monthly"));
                                                    var h = $("#" + r).data("display");

                                                    function g(e, t) {
                                                        var a = !1;
                                                        return e / t < 30 && (a = !0), a
                                                    }
                                                    if ($(".analytics_chart .toggle_chart_data").each((function() {
                                                            $(this).addClass("selected")
                                                        })), d.find(".analytics-grand-title .title-date").html(generateTitleDate(p, m)), d.find(".analytics-grand-title .date-range").html(u + (1 == u ? " day" : " days") + " (" + f + (1 == f ? " month" : " months") + ")"), s.result_container = r, G_MARKETPLACE_ORDER_CODE.forEach((function(e, a, r) {
                                                            t[e] && (i++, s[e] = jQuery.extend(!0, {}, t[e].chart_data[h]), s[e].currency_symbol = t[e].marketplace_info.currency_symbol, 0 == l && (l = s[e].datesData.length))
                                                        })), l *= i, n = g(o.width(), l), createChart(s, n), c = chartContainers[s.result_container], $(".analytics_chart .change_chart_view").off().on("click", (function() {
                                                            var e = $(this),
                                                                t = e.data("view");
                                                            switch ($(".analytics_chart .change_chart_view").each((function() {
                                                                    $(this).removeClass("selected")
                                                                })), e.addClass("selected"), t) {
                                                                case "default":
                                                                    o.css("position", "relative"), o.css("width", "100%"), o.css("left", "0px"), o.css("right", "0px");
                                                                    break;
                                                                case "full":
                                                                    var a = 35,
                                                                        s = -($(".analytics_chart").offset().left - a);
                                                                    o.css("position", "absolute"), o.css("width", "auto"), o.css("left", s + "px"), o.css("right", s + "px");
                                                                    break;
                                                                default:
                                                                    break
                                                            }
                                                            n = g(o.width(), l), c && (c.data.datasets.forEach((function(e, t, a) {
                                                                e.label.includes("Sold") && (e.hide_labels = n)
                                                            })), c.update())
                                                        })), $(".analytics_chart .toggle_chart_data").off().on("click", (function(e) {
                                                            var t = $(this),
                                                                a = t.data("target"),
                                                                s = !1;
                                                            t.hasClass("selected") ? (t.removeClass("selected"), s = !0) : (t.addClass("selected"), s = !1), c && (c.data.datasets.forEach((function(e, t, i) {
                                                                e.label.toLowerCase().includes(a) && (e.hidden = s)
                                                            })), c.update())
                                                        })), $(".analytics_chart .toggle_chart_layout").off().on("click", (function() {
                                                            var e = $(this),
                                                                a = e.data("layout");
                                                            $("#" + r).data("display", a), $(".analytics_chart .toggle_chart_layout").each((function() {
                                                                $(this).removeClass("selected")
                                                            })), e.addClass("selected"), i = 0, l = 0, c = !1, (s = {}).result_container = r, G_MARKETPLACE_ORDER_CODE.forEach((function(e, r, o) {
                                                                t[e] && (i++, s[e] = jQuery.extend(!0, {}, t[e].chart_data[a]), s[e].currency_symbol = t[e].marketplace_info.currency_symbol, 0 == l && (l = s[e].datesData.length))
                                                            })), l *= i, n = g(o.width(), l), createChart(s, n), c = chartContainers[s.result_container]
                                                        })), d.find(".grand-totals .number").html(t.grand_totals.net_sales), d.find(".remove-on-refresh").each((function() {
                                                            $(this).remove()
                                                        })), i > 1) {
                                                        var b = '<div class="analytics-row percent-sales-per-marketplace remove-on-refresh clearfix"><div class="row analytics-content clearfix"><div class="col-6 sales"><div class="analytics-item-title text-center">% Products Sold Per Marketplace</div></div><div class="col-6 returns"><div class="analytics-item-title text-center">% Returns Per Marketplace</div></div></div></div>';
                                                        d.find(".mrkt-totals").after(b)
                                                    }
                                                    G_MARKETPLACE_ORDER_CODE.forEach((function(e, s, l) {
                                                        if (t[e]) {
                                                            var r = jQuery.extend(!0, {}, t[e]),
                                                                o = r.market_totals.total_royalties.toFixed(3),
                                                                n = Math.trunc(o),
                                                                c = (Math.abs(o) % 1).toFixed(3).substring(1, 4),
                                                                p = 0,
                                                                m = 0;
                                                            p = a ? r.market_totals.net_sales - r.market_totals.total_returned : r.market_totals.net_sales, r.market_totals.total_royalties > 0 && (m = (r.market_totals.total_royalties / p).toFixed(3));
                                                            var u = Math.trunc(m),
                                                                v = (Math.abs(m) % 1).toFixed(3).substring(1, 4),
                                                                f = '<div class="analytics-content remove-on-refresh clearfix"><div class="analytics-item flag"><img src="' + chrome.extension.getURL("/assets/img/" + r.marketplace_info.flag_img) + '" data-toggle="tooltip" title="' + r.marketplace_info.country_name + '"></div><div class="analytics-item sales"><div class="number"><span class="sales">' + r.market_totals.net_sales + '</span></div><div class="footer sold-cancelled" title="Sold - Cancelled">' + r.market_totals.total_sold + " - " + r.market_totals.total_cancelled + '</div></div><div class="analytics-item returns"><div class="number">' + r.market_totals.total_returned + '</div></div><div class="analytics-item royalties"><div class="number ' + royaltiesTaxClass() + '" title="' + royaltiesTitleText(o, r.marketplace_info.currency_symbol) + '"><span class="currency-symbol">' + r.marketplace_info.currency_symbol + '</span><span class="number">' + n + '</span><span class="decimal">' + c + "</span>" + royaltiesTaxIcon() + '</div><div class="footer" title="Revenue"><span class="currency-symbol">' + r.marketplace_info.currency_symbol + '</span><span class="revenue">' + r.market_totals.total_revenue.toFixed(2) + '</span></div></div><div class="analytics-item royalties-per-sale"><div class="number ' + royaltiesTaxClass() + '" title="' + royaltiesTitleText(m, r.marketplace_info.currency_symbol) + '"><span class="currency-symbol">' + r.marketplace_info.currency_symbol + '</span><span class="number">' + u + '</span><span class="decimal">' + v + "</span>" + royaltiesTaxIcon() + "</div></div></div>";
                                                            if (d.find(".mrkt-totals .sales-per-marketplace").append(f), i > 1) {
                                                                var h = 0;
                                                                t.grand_totals.net_sales > 0 && (h = Math.round(r.market_totals.net_sales / t.grand_totals.net_sales * 100));
                                                                var g = '<div class="custom-progress blue remove-on-refresh"><div class="text-line clearfix"><div class="text">' + r.marketplace_info.country_name + '</div><div class="number">' + h + '%<span class="light-number">(' + r.market_totals.net_sales + ')</span></div></div><div class="progress"><div class="progress-bar" style="width:' + h + '%"></div></div></div>';
                                                                d.find(".percent-sales-per-marketplace .sales").append(g);
                                                                var b = 0;
                                                                t.grand_totals.total_returned > 0 && (b = Math.round(r.market_totals.total_returned / t.grand_totals.total_returned * 100));
                                                                var _ = '<div class="custom-progress yellow remove-on-refresh"><div class="text-line clearfix"><div class="text">' + r.marketplace_info.country_name + '</div><div class="number">' + b + '%<span class="light-number">(' + r.market_totals.total_returned + ')</span></div></div><div class="progress"><div class="progress-bar" style="width:' + b + '%"></div></div></div>';
                                                                d.find(".percent-sales-per-marketplace .returns").append(_)
                                                            }
                                                        }
                                                    })), d.find(".sales-averages .avg-per-day .analytics-section-title .subtitle").html("For " + u + (1 == u ? " day" : " days")), d.find(".sales-averages .avg-per-month .analytics-section-title .subtitle").html("For " + f + (1 == f ? " month" : " months"));
                                                    var _ = Math.round(t.grand_totals.net_sales / u);
                                                    d.find(".sales-averages .avg-sales-day .number").html(_);
                                                    var y = t.grand_totals.total_returned / u;
                                                    y % 1 > 0 && (y = Math.trunc(y) + "-" + Math.trunc(y + 1)), d.find(".sales-averages .avg-returns-day .number").html(y);
                                                    var w = Math.round(t.grand_totals.net_sales / f);
                                                    d.find(".sales-averages .avg-sales-month .number").html(w);
                                                    var k = t.grand_totals.total_returned / f;
                                                    k % 1 > 0 && (k = Math.trunc(k) + "-" + Math.trunc(k + 1)), d.find(".sales-averages .avg-returns-month .number").html(k), f < 1 ? (d.find(".sales-averages .avg-per-month .analytics-item").addClass("not-applicable"), d.find(".sales-averages .avg-per-month .explanation-block").html("<div>* Cannot be calculated because the date range is less than one month</div>").removeClass("hidden"), d.find(".sales-averages .avg-sales-month .number").html("-"), d.find(".sales-averages .avg-returns-month .number").html("-"), d.find(".sales-averages .avg-per-month .currency-symbol").html(""), d.find(".sales-averages .avg-per-month .number_int").html("-"), d.find(".sales-averages .avg-per-month .number_dec").html("")) : (d.find(".sales-averages .avg-per-month .analytics-item").removeClass("not-applicable"), d.find(".sales-averages .avg-per-month .explanation-block").html("").addClass("hidden")), i > 1 ? (d.find(".sales-averages .avg-royalties-day").addClass("not-applicable"), d.find(".sales-averages .avg-per-day .explanation-block").html("<div>* Average royalties cannot be calculated when more than one marketplace is selected</div>").removeClass("hidden"), d.find(".sales-averages .avg-royalties-month").addClass("not-applicable"), d.find(".sales-averages .avg-per-month .explanation-block").append("<div>* Average royalties cannot be calculated when more than one marketplace is selected</div>").removeClass("hidden"), d.find(".sales-averages .avg-royalties-day .currency-symbol").html(""), d.find(".sales-averages .avg-royalties-day .number_int").html("-"), d.find(".sales-averages .avg-royalties-day .number_dec").html(""), d.find(".sales-averages .avg-royalties-month .currency-symbol").html(""), d.find(".sales-averages .avg-royalties-month .number_int").html("-"), d.find(".sales-averages .avg-royalties-month .number_dec").html("")) : G_MARKETPLACE_ORDER_CODE.forEach((function(e, a, s) {
                                                        if (t[e]) {
                                                            var i = jQuery.extend(!0, {}, t[e]);
                                                            d.find(".sales-averages .avg-royalties-day").removeClass("not-applicable"), d.find(".sales-averages .avg-per-day .explanation-block").html("").addClass("hidden");
                                                            var l = 0;
                                                            i.market_totals.total_royalties > 0 && (l = (i.market_totals.total_royalties / u).toFixed(2));
                                                            var r = Math.trunc(l),
                                                                o = (Math.abs(l) % 1).toFixed(3).substring(1, 4);
                                                            if (d.find(".sales-averages .avg-royalties-day .currency-symbol").html(i.market_totals.currency_symbol), d.find(".sales-averages .avg-royalties-day .number_int").html(r), d.find(".sales-averages .avg-royalties-day .number_dec").html(o), formatRoyaltiesElement(d.find(".sales-averages .avg-royalties-day > .number"), l, i.market_totals.currency_symbol), f < 1);
                                                            else {
                                                                d.find(".sales-averages .avg-royalties-month").removeClass("not-applicable");
                                                                var n = 0;
                                                                i.market_totals.total_royalties > 0 && (n = (i.market_totals.total_royalties / f).toFixed(2));
                                                                var c = Math.trunc(n),
                                                                    p = (Math.abs(n) % 1).toFixed(3).substring(1, 4);
                                                                d.find(".sales-averages .avg-royalties-month .currency-symbol").html(i.market_totals.currency_symbol), d.find(".sales-averages .avg-royalties-month .number_int").html(c), d.find(".sales-averages .avg-royalties-month .number_dec").html(p), formatRoyaltiesElement(d.find(".sales-averages .avg-royalties-month > .number"), n, i.market_totals.currency_symbol)
                                                            }
                                                        }
                                                    }));
                                                    var C = {
                                                        day: {
                                                            sales: {
                                                                mrkt: "",
                                                                index: 0,
                                                                date: "",
                                                                value: 0
                                                            },
                                                            returns: {
                                                                mrkt: "",
                                                                index: 0,
                                                                date: "",
                                                                value: 0
                                                            },
                                                            royalties: {
                                                                mrkt: "",
                                                                index: 0,
                                                                date: "",
                                                                value: 0
                                                            }
                                                        },
                                                        month: {
                                                            sales: {
                                                                mrkt: "",
                                                                index: 0,
                                                                date: "",
                                                                value: 0
                                                            },
                                                            returns: {
                                                                mrkt: "",
                                                                index: 0,
                                                                date: "",
                                                                value: 0
                                                            },
                                                            royalties: {
                                                                mrkt: "",
                                                                index: 0,
                                                                date: "",
                                                                value: 0
                                                            }
                                                        }
                                                    };
                                                    G_MARKETPLACE_ORDER_CODE.forEach((function(e, a, s) {
                                                        if (t[e]) {
                                                            var i = jQuery.extend(!0, {}, t[e]),
                                                                l = [];
                                                            l = i.chart_data.daily, this_max = Math.max.apply(null, l.netSoldData), this_max > C.day.sales.value && (C.day.sales.mrkt = e, C.day.sales.index = l.netSoldData.indexOf(this_max), C.day.sales.date = l.datesData[C.day.sales.index], C.day.sales.value = this_max), this_max = Math.max.apply(null, l.returnedData), this_max > C.day.returns.value && (C.day.returns.mrkt = e, C.day.returns.index = l.returnedData.indexOf(this_max), C.day.returns.date = l.datesData[C.day.returns.index], C.day.returns.value = this_max), this_max = Math.max.apply(null, l.royaltiesData), this_max > C.day.royalties.value && (C.day.royalties.mrkt = e, C.day.royalties.index = l.royaltiesData.indexOf(this_max), C.day.royalties.date = l.datesData[C.day.royalties.index], C.day.royalties.value = this_max), l = i.chart_data.monthly, this_max = Math.max.apply(null, l.netSoldData), this_max > C.month.sales.value && (C.month.sales.mrkt = e, C.month.sales.index = l.netSoldData.indexOf(this_max), C.month.sales.date = l.datesData[C.month.sales.index], C.month.sales.value = this_max), this_max = Math.max.apply(null, l.returnedData), this_max > C.month.returns.value && (C.month.returns.mrkt = e, C.month.returns.index = l.returnedData.indexOf(this_max), C.month.returns.date = l.datesData[C.month.returns.index], C.month.returns.value = this_max), this_max = Math.max.apply(null, l.royaltiesData), this_max > C.month.royalties.value && (C.month.royalties.mrkt = e, C.month.royalties.index = l.royaltiesData.indexOf(this_max), C.month.royalties.date = l.datesData[C.month.royalties.index], C.month.royalties.value = this_max)
                                                        }
                                                    }));
                                                    var M = C.day.sales.value > 0 ? moment(C.day.sales.date).format("MM-DD-YYYY") : "",
                                                        P = C.day.sales.value > 0 ? " (" + C.day.sales.mrkt.toUpperCase() + ")" : "";
                                                    d.find(".record-days-months .record-days .record-sales-day .number").html(C.day.sales.value), d.find(".record-days-months .record-days .record-sales-day .footer").html(M), i > 1 && d.find(".record-days-months .record-days .record-sales-day .footer").append(P), M = C.day.returns.value > 0 ? moment(C.day.returns.date).format("MM-DD-YYYY") : "", P = C.day.returns.value > 0 ? " (" + C.day.returns.mrkt.toUpperCase() + ")" : "", d.find(".record-days-months .record-days .record-returns-day .number").html(C.day.returns.value), d.find(".record-days-months .record-days .record-returns-day .footer").html(M), i > 1 && d.find(".record-days-months .record-days .record-returns-day .footer").append(P), M = C.day.royalties.value > 0 ? moment(C.day.royalties.date).format("MM-DD-YYYY") : "", P = C.day.royalties.value > 0 ? " (" + C.day.royalties.mrkt.toUpperCase() + ")" : "";
                                                    var R = C.day.royalties.value > 0 ? t[C.day.royalties.mrkt].marketplace_info.currency_symbol : "",
                                                        S = C.day.royalties.value.toFixed(2),
                                                        T = Math.trunc(S),
                                                        L = (Math.abs(S) % 1).toFixed(3).substring(1, 4);
                                                    if (d.find(".record-days-months .record-days .record-royalties-day .currency-symbol").html(R), d.find(".record-days-months .record-days .record-royalties-day .number_int").html(T), d.find(".record-days-months .record-days .record-royalties-day .number_dec").html(L), d.find(".record-days-months .record-days .record-royalties-day .footer").html(M), i > 1 && d.find(".record-days-months .record-days .record-royalties-day .footer").append(P), C.day.royalties.value > 0 && formatRoyaltiesElement(d.find(".record-days-months .record-days .record-royalties-day > .number"), S, t[C.day.royalties.mrkt].marketplace_info.currency_symbol), v > 1 ? (d.find(".record-days-months .record-months .analytics-item").removeClass("not-applicable"), d.find(".record-days-months .record-months .explanation-block").html("").addClass("hidden"), M = C.month.sales.value > 0 ? moment(C.month.sales.date).format("MMMM YYYY") : "", P = C.month.sales.value > 0 ? " (" + C.month.sales.mrkt.toUpperCase() + ")" : "", d.find(".record-days-months .record-months .record-sales-month .number").html(C.month.sales.value), d.find(".record-days-months .record-months .record-sales-month .footer").html(M).removeClass("hidden"), i > 1 && d.find(".record-days-months .record-months .record-sales-month .footer").append(P), M = C.month.returns.value > 0 ? moment(C.month.returns.date).format("MMMM YYYY") : "", P = C.month.returns.value > 0 ? " (" + C.month.returns.mrkt.toUpperCase() + ")" : "", d.find(".record-days-months .record-months .record-returns-month .number").html(C.month.returns.value), d.find(".record-days-months .record-months .record-returns-month .footer").html(M).removeClass("hidden"), i > 1 && d.find(".record-days-months .record-months .record-returns-month .footer").append(P), M = C.month.royalties.value > 0 ? moment(C.month.royalties.date).format("MMMM YYYY") : "", P = C.month.royalties.value > 0 ? " (" + C.month.royalties.mrkt.toUpperCase() + ")" : "", S = C.month.royalties.value.toFixed(2), T = Math.trunc(S), L = (Math.abs(S) % 1).toFixed(3).substring(1, 4), d.find(".record-days-months .record-months .record-royalties-month .currency-symbol").html(t[C.month.royalties.mrkt].marketplace_info.currency_symbol), d.find(".record-days-months .record-months .record-royalties-month .number_int").html(T), d.find(".record-days-months .record-months .record-royalties-month .number_dec").html(L), d.find(".record-days-months .record-months .record-royalties-month .footer").html(M).removeClass("hidden"), i > 1 && d.find(".record-days-months .record-months .record-royalties-month .footer").append(P), C.month.royalties.value > 0 && formatRoyaltiesElement(d.find(".record-days-months .record-months .record-royalties-month > .number"), S, t[C.month.royalties.mrkt].marketplace_info.currency_symbol)) : (d.find(".record-days-months .record-months .analytics-item").addClass("not-applicable"), d.find(".record-days-months .record-months .explanation-block").html("<div>* Cannot be calculated because the date range contains less than 2 distinct months</div>").removeClass("hidden"), d.find(".record-days-months .record-months .record-sales-month .number").html("-"), d.find(".record-days-months .record-months .record-sales-month .footer").html("").addClass("hidden"), d.find(".record-days-months .record-months .record-returns-month .number").html("-"), d.find(".record-days-months .record-months .record-returns-month .footer").html("").addClass("hidden"), d.find(".record-days-months .record-months .record-royalties-month .currency-symbol").html(""), d.find(".record-days-months .record-months .record-royalties-month .number_int").html("-"), d.find(".record-days-months .record-months .record-royalties-month .number_dec").html(""), d.find(".record-days-months .record-months .record-royalties-month .footer").html("").addClass("hidden")), !t.grand_totals.net_sales > 0) d.find(".top-products-fit-color").addClass("hidden keep-hidden");
                                                    else {
                                                        d.find(".top-products-fit-color").removeClass("keep-hidden");
                                                        var O = jQuery.extend(!0, {}, t.grand_variation_totals),
                                                            E = t.grand_totals.net_sales,
                                                            D = '<div class="row analytics-content remove-on-refresh clearfix">',
                                                            A = 4;
                                                        O.productType = O.productType.sort((function(e, t) {
                                                            return t.total - e.total
                                                        })), O.productType.forEach((function(e, t, a) {
                                                            t > 0 && t % A == 0 && (D += '</div><div class="row analytics-content remove-on-refresh clearfix">');
                                                            var s = Math.round(e.total / E * 100);
                                                            D += '<div class="col-3"><div class="product-img"><img src="' + chrome.extension.getURL("/assets/img/blanks/" + e.variation + ".png") + '"></div><div class="analytics-item-title text-center" title="' + e.variation.replace(/_/g, " ").toUpperCase() + '">' + e.variation.replace(/_/g, " ").toUpperCase() + '</div><div class="custom-progress inverse-custom-progress blue"><div class="progress"><div class="progress-bar" style="width:' + s + '%"></div></div><div class="text-line clearfix"><div class="number">' + s + '%<span class="light-number">(' + e.total + ")</span></div></div></div></div>"
                                                        })), D += "</div>", d.find(".top-products").append(D);
                                                        var I = '<div class="row analytics-content remove-on-refresh clearfix">';
                                                        A = 4;
                                                        O.fitType = O.fitType.sort((function(e, t) {
                                                            return t.total - e.total
                                                        })), O.fitType.forEach((function(e, t, a) {
                                                            t > 0 && t % A == 0 && (I += '</div><div class="row analytics-content remove-on-refresh clearfix">');
                                                            var s = Math.round(e.total / E * 100);
                                                            I += '<div class="col-3"><div class="product-img"><img src="' + chrome.extension.getURL("/assets/img/" + e.variation + "-icon.png") + '"></div><div class="analytics-item-title text-center" title="' + e.variation.replace(/_/g, " ").toUpperCase() + '">' + e.variation.replace(/_/g, " ").toUpperCase() + '</div><div class="custom-progress inverse-custom-progress yellow"><div class="progress"><div class="progress-bar" style="width:' + s + '%"></div></div><div class="text-line clearfix"><div class="number">' + s + '%<span class="light-number">(' + e.total + ")</span></div></div></div></div>"
                                                        })), I += "</div>", d.find(".top-fit-types").append(I);
                                                        var U = '<div class="analytics-content remove-on-refresh clearfix">',
                                                            N = 10;
                                                        O.color = O.color.sort((function(e, t) {
                                                            return t.total - e.total
                                                        })), O.color.forEach((function(e, t, a) {
                                                            t > 0 && t % N == 0 && (U += '</div><div class="analytics-content remove-on-refresh clearfix">');
                                                            var s = e.variation.replace(/\//g, "_"),
                                                                i = toTitleCase(e.variation.replace(/_/g, " ")),
                                                                l = Math.round(e.total / E * 100);
                                                            U += '<div class="colour-circle ' + s + '" data-toggle="tooltip" title="' + i + '"><div class="percent">' + l + '%</div><div class="number">(' + e.total + ")</div></div>"
                                                        })), U += "</div>", d.find(".analytics-top-colors").append(U)
                                                    }
                                                    var F = [];
                                                    G_MARKETPLACE_ORDER_CODE.forEach((function(e, a, s) {
                                                        if (t[e]) {
                                                            var i = jQuery.extend(!0, {}, t[e]);
                                                            F = F.concat(i.product_list)
                                                        }
                                                    }));
                                                    var q = 0,
                                                        Y = "";
                                                    if (1 == i && G_MARKETPLACE_ORDER_CODE.forEach((function(e, a, s) {
                                                            if (t[e]) {
                                                                var i = jQuery.extend(!0, {}, t[e]);
                                                                q = i.market_totals.total_royalties, Y = i.marketplace_info.currency_symbol
                                                            }
                                                        })), !t.grand_totals.net_sales > 0) d.find(".products-vs-sales-royalties").addClass("hidden keep-hidden");
                                                    else {
                                                        d.find(".products-vs-sales-royalties").removeClass("keep-hidden");
                                                        var B = F.length;
                                                        d.find(".products-vs-sales-royalties .unique-products .number").html(B);
                                                        var z = $("#prettydash-wrapper .total-limit .used").html();
                                                        if (z > 0) {
                                                            var G = (B / z * 100).toFixed(1);
                                                            d.find(".products-vs-sales-royalties .percent-of-live .number").html(G + '<span class="percent-symbol">%</span>')
                                                        } else d.find(".products-vs-sales-royalties .percent-of-live .number").html("-");
                                                        var H = 0,
                                                            W = 0,
                                                            K = 0,
                                                            j = 0;
                                                        for (F = F.sort((function(e, t) {
                                                                return t.net_sold - e.net_sold
                                                            })), x = 0; x < F.length; ++x)
                                                            if (++H, j = (K += F[x].net_sold) / t.grand_totals.net_sales * 100, Math.ceil(j) >= 80) {
                                                                W = H / B * 100;
                                                                var V = Math.round(j) + '<span class="percent-symbol">%</span>';
                                                                V += '<i class="fa fa-arrow-right from-to-arrow"></i>', V += Math.round(W) + '<span class="percent-symbol">%</span>';
                                                                var J = K + " sales were generated by " + H + " products";
                                                                d.find(".products-vs-sales-royalties .products-vs-sales .number").html(V), d.find(".products-vs-sales-royalties .products-vs-sales .footer").html(J), x = F.length
                                                            } if (1 == i) {
                                                            for (d.find(".products-vs-sales-royalties .products-vs-royalties .analytics-item").removeClass("not-applicable"), H = 0, W = 0, K = 0, j = 0, F = F.sort((function(e, t) {
                                                                    return t.royalties.value - e.royalties.value
                                                                })), x = 0; x < F.length; ++x)
                                                                if (++H, j = (K += F[x].royalties.value) / q * 100, Math.ceil(j) >= 80) {
                                                                    W = H / B * 100;
                                                                    V = Math.round(j) + '<span class="percent-symbol">%</span>';
                                                                    V += '<i class="fa fa-arrow-right from-to-arrow"></i>', V += Math.round(W) + '<span class="percent-symbol">%</span>';
                                                                    J = Y + K.toFixed(2) + " in royalties were generated by " + H + " products";
                                                                    d.find(".products-vs-sales-royalties .products-vs-royalties .number").html(V), d.find(".products-vs-sales-royalties .products-vs-royalties .footer").html(J), x = F.length
                                                                }
                                                        } else d.find(".products-vs-sales-royalties .products-vs-royalties .analytics-item").addClass("not-applicable"), d.find(".products-vs-sales-royalties .products-vs-royalties .number").html("-"), d.find(".products-vs-sales-royalties .products-vs-royalties .footer").html('<div style="font-style:italic">* Cannot be calculated when more than one marketplace is selected</div>')
                                                    }
                                                    $(".products-sold-table-container").data("sort-by", "royalties"), $(".products-sold-table-container").data("sort-order", "desc"), $(".products-sold-table-container").data("search-query", ""), $(".products-sold-table-container").data("filter-product", "all"), $(".products-sold-table-container").data("filter-color", "all"), $(".products-sold-table-container").data("filter-marketplace", "all"), t.grand_variation_totals.productType = t.grand_variation_totals.productType.sort((function(e, t) {
                                                        return e.variation.localeCompare(t.variation, {
                                                            ignorePunctuation: !0
                                                        })
                                                    }));
                                                    var X = d.find("select.product_filter");
                                                    X.html(""), X.append($("<option />").val("all").text("All Product Types")), t.grand_variation_totals.productType.forEach((function(e, t, a) {
                                                        X.append($("<option />").val(e.variation).text(e.variation.replace(/_/g, " ")))
                                                    })), t.grand_variation_totals.color = t.grand_variation_totals.color.sort((function(e, t) {
                                                        return e.variation.localeCompare(t.variation, {
                                                            ignorePunctuation: !0
                                                        })
                                                    }));
                                                    var Q = d.find("select.color_filter");
                                                    Q.html(""), Q.append($("<option />").val("all").text("All Colors")), t.grand_variation_totals.color.forEach((function(e, t, a) {
                                                        Q.append($("<option />").val(e.variation).text(e.variation.replace(/_/g, " ")))
                                                    }));
                                                    var Z = d.find("select.market_filter");
                                                    Z.html(""), Z.append($("<option />").val("all").text("All Markets")), G_MARKETPLACE_ORDER_CODE.forEach((function(e, a, s) {
                                                        t[e] && Z.append($("<option />").val(e).text(t[e].marketplace_info.country_name))
                                                    }));
                                                    var ee, te = 0,
                                                        ae = 15,
                                                        se = [];

                                                    function ie(e) {
                                                        te = 0, se = [];
                                                        var a = [];
                                                        e.forEach((function(e, t, s) {
                                                            a.push(jQuery.extend(!0, {}, e))
                                                        }));
                                                        var s = !1,
                                                            l = $(".products-sold-table-container"),
                                                            r = {
                                                                sort_by: l.data("sort-by"),
                                                                sort_order: l.data("sort-order"),
                                                                search_query: l.data("search-query").trim().toLowerCase(),
                                                                filter_product: l.data("filter-product"),
                                                                filter_color: l.data("filter-color"),
                                                                filter_marketplace: l.data("filter-marketplace")
                                                            };
                                                        if (a.length > 0) {
                                                            if ("all" != r.filter_marketplace && (a = a.filter((function(e) {
                                                                    return e.marketplace_code == r.filter_marketplace
                                                                })), s = !0), "all" != r.filter_product && (a = a.filter((function(e) {
                                                                    return e.pretty_productType.replace(/\s+/g, "_").toLowerCase() == r.filter_product
                                                                })), s = !0), "" != r.search_query) {
                                                                var o = r.search_query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                                                                a = (a = a.filter((function(e) {
                                                                    var t = !1,
                                                                        a = e.asinName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
                                                                        s = e.asin.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                                                                    return (a.includes(o) || s.includes(o)) && (t = !0), t
                                                                }))).map((function(e, t, a) {
                                                                    var s = r.search_query;
                                                                    s = s.replace(/(\s+)/, "(<[^>]+>)*$1(<[^>]+>)*");
                                                                    var i = new RegExp("(" + s + ")", "gi");
                                                                    return e.asinName = e.asinName.replace(i, "<mark>$1</mark>"), e.asinName = e.asinName.replace(/(<mark>[^<>]*)((<[^>]+>)+)([^<>]*<\/mark>)/, "$1</mark>$2<mark>$4"), e.formattedAsin = e.asin.replace(i, "<mark>$1</mark>"), e.formattedAsin = e.formattedAsin.replace(/(<mark>[^<>]*)((<[^>]+>)+)([^<>]*<\/mark>)/, "$1</mark>$2<mark>$4"), e
                                                                })), s = !0
                                                            }
                                                            switch ("all" != r.filter_color && (a = a.filter((function(e) {
                                                                    var t = !1;
                                                                    return e.variation_totals.color.forEach((function(e) {
                                                                        e.variation == r.filter_color && (t = !0)
                                                                    })), t
                                                                })), s = !0), r.sort_by) {
                                                                case "sales":
                                                                    a = "desc" == r.sort_order ? a.sort((function(e, t) {
                                                                        return t.net_sold - e.net_sold
                                                                    })) : a.sort((function(e, t) {
                                                                        return e.net_sold - t.net_sold
                                                                    }));
                                                                    break;
                                                                case "royalties":
                                                                    a = "desc" == r.sort_order ? a.sort((function(e, t) {
                                                                        return t.royalties.value - e.royalties.value
                                                                    })) : a.sort((function(e, t) {
                                                                        return e.royalties.value - t.royalties.value
                                                                    }));
                                                                    break;
                                                                case "returns":
                                                                    a = "desc" == r.sort_order ? a.sort((function(e, t) {
                                                                        return t.unitsReturned - e.unitsReturned
                                                                    })) : a.sort((function(e, t) {
                                                                        return e.unitsReturned - t.unitsReturned
                                                                    }));
                                                                    break;
                                                                case "title":
                                                                    a = "desc" == r.sort_order ? a.sort((function(e, t) {
                                                                        return t.asinName.localeCompare(e.asinName, {
                                                                            ignorePunctuation: !0
                                                                        })
                                                                    })) : a.sort((function(e, t) {
                                                                        return e.asinName.localeCompare(t.asinName, {
                                                                            ignorePunctuation: !0
                                                                        })
                                                                    }));
                                                                    break;
                                                                case "product":
                                                                    a = "desc" == r.sort_order ? a.sort((function(e, t) {
                                                                        return t.productType.localeCompare(e.productType, {
                                                                            ignorePunctuation: !0
                                                                        })
                                                                    })) : a.sort((function(e, t) {
                                                                        return e.productType.localeCompare(t.productType, {
                                                                            ignorePunctuation: !0
                                                                        })
                                                                    }));
                                                                    break;
                                                                default:
                                                                    a = a.sort((function(e, t) {
                                                                        return t.net_sold - e.net_sold
                                                                    }))
                                                            }
                                                        }
                                                        var n = e.length,
                                                            c = a.length;
                                                        d.find(".products-sold-table-filters .product-count .filtered-products-shown").addClass("hidden"), d.find(".products-sold-table-filters .product-count .total-proucts-shown .number").html(n), s && (d.find(".products-sold-table-filters .product-count .filtered-products-shown .number").html(c), d.find(".products-sold-table-filters .product-count .filtered-products-shown").removeClass("hidden"));
                                                        var p = "";
                                                        if (a.length > 0) {
                                                            var m = "",
                                                                u = $("#blur_switch").is(":checked"),
                                                                v = "",
                                                                f = "",
                                                                h = "";
                                                            u && (m = "blur-contents"), f = '<div class="analytics-products-table-actions pm_toolbar clearfix" data-target-table=".products-sold-table-container .table.shirts-list" style="margin: 5px 0 10px 0; position: relative"><div class="pm_btn_radio_container float-left clearfix" style="margin-right: 15px"><div class="pm_btn pm_select_all_rows"><i class="fa fa-check-square" style="line-height: 18px"></i> Select All</div> <div class="pm_btn pm_unselect_all_rows"><i class="fa fa-square-o" style="line-height: 18px"></i> Unselect All</div> </div><div class="pm_btn enable-when-rows-selected disabled batch-edit-products" style="margin-right: 12px;"><i class="fa fa-pencil" style="line-height: 18px"></i> Batch Edit</div> <div class="product-count float-left hidden"></div></div>', f += '<table class="table shirts-list template-full with-checkbox pm-table-hover" data-toolbar=".analytics-products-table-actions.pm_toolbar"><thead><tr><th scope="col" class="pm-checkbox"></th><th scope="col">&nbsp;</th><th scope="col" class="sortable ' + ("title" == r.sort_by ? "sorted" : "") + '" data-sort-by="title" data-sort-order="' + ("title" == r.sort_by ? "desc" == r.sort_order ? "desc" : "asc" : "") + '">Title<i class="fa fa-sort-amount-' + ("desc" == r.sort_order ? "desc" : "asc") + '"></i></th><th scope="col" class="sortable ' + ("product" == r.sort_by ? "sorted" : "") + '" data-sort-by="product" data-sort-order="' + ("product" == r.sort_by ? "desc" == r.sort_order ? "desc" : "asc" : "") + '">Product<i class="fa fa-sort-amount-' + ("desc" == r.sort_order ? "desc" : "asc") + '"></i></th><th scope="col" class="text-center sortable ' + ("sales" == r.sort_by ? "sorted" : "") + '" data-sort-by="sales" data-sort-order="' + ("sales" == r.sort_by ? "desc" == r.sort_order ? "desc" : "asc" : "") + '">Sales<i class="fa fa-sort-amount-' + ("desc" == r.sort_order ? "desc" : "asc") + '"></i></th><th scope="col" class="text-center sortable ' + ("returns" == r.sort_by ? "sorted" : "") + '" data-sort-by="returns" data-sort-order="' + ("returns" == r.sort_by ? "desc" == r.sort_order ? "desc" : "asc" : "") + '">Ret.<i class="fa fa-sort-amount-' + ("desc" == r.sort_order ? "desc" : "asc") + '"></i></th><th scope="col" class="text-center sortable ' + ("royalties" == r.sort_by ? "sorted" : "") + '" data-sort-by="royalties" data-sort-order="' + ("royalties" == r.sort_by ? "desc" == r.sort_order ? "desc" : "asc" : "") + '">Royalties<i class="fa fa-sort-amount-' + ("desc" == r.sort_order ? "desc" : "asc") + '"></i></th><th scope="col">Fit Type</th><th scope="col" colspan="2" style="position: relative">Color<div class="switch-wrapper clearfix" style="position:absolute; right:0; bottom:10px;" data-toggle="tooltip" data-html="true" title="Screenshot Mode<br/>Hides titles for screenshot"><i class="fa fa-eye-slash" style="margin-right:3px;" ></i><div class="switch-container float-right"><label for="blur_switch_3"><input type="checkbox" id="blur_switch_3" class="hide-titles" ' + ($("#blur_switch").is(":checked") ? "checked" : "") + '/><span class="switch"></span><span class="toggle"></span></label></div></div></th></tr></thead><tbody>';
                                                            var g = !1,
                                                                b = 0,
                                                                _ = 0,
                                                                y = 0,
                                                                w = 0;
                                                            a.forEach((function(e, a, l) {
                                                                var o = {},
                                                                    d = 0,
                                                                    n = "",
                                                                    c = "https://www.amazon" + e.marketplace_extension + "/dp/" + e.asin;
                                                                e.currency_symbol = t[e.marketplace_code].marketplace_info.currency_symbol;
                                                                var u = "popsockets" == e.pretty_productType.toLowerCase();
                                                                e.variation_totals.color = e.variation_totals.color.sort((function(e, t) {
                                                                    return t.total - e.total
                                                                })), e.variation_totals.color.forEach((function(e) {
                                                                    var t = e.variation.replace(/\//g, "_"),
                                                                        a = toTitleCase(e.variation.replace(/_/g, " "));
                                                                    n += '<div class="colour-circle ' + t + '" title="' + a + '">' + e.total + "</div>"
                                                                })), e.variation_totals.fitType.forEach((function(e) {
                                                                    o[e.variation] = e.total
                                                                })), v = u ? '<div class="shirt-stats enabled" title="PopSockets"><div class="icon"><i class="fa fa-circle"></i></div><div class="number">' + e.net_sold + "</div></div>" : o.unisex ? '<div class="shirt-stats ' + (o.unisex ? "enabled" : "") + '" title="Unisex"><div class="icon"><i class="fa fa-user"></i></div><div class="number">' + (o.unisex ? o.unisex : 0) + "</div></div>" : '<div class="shirt-stats ' + (o.men ? "enabled" : "") + '" title="Men"><div class="icon"><i class="fa fa-male"></i></div><div class="number">' + (o.men ? o.men : 0) + '</div></div><div class="shirt-stats ' + (o.women ? "enabled" : "") + '" title="Women"><div class="icon"><i class="fa fa-female"></i></div><div class="number">' + (o.women ? o.women : 0) + '</div></div><div class="shirt-stats ' + (o.kids ? "enabled" : "") + '" title="Kids" style="margin-right:0"><div class="icon"><i class="fa fa-child"></i></div><div class="number">' + (o.kids ? o.kids : 0) + "</div></div>", d = e.royalties.value > 0 ? e.currency_symbol + parseFloat(e.royalties.value / e.net_sold).toFixed(2) : "&nbsp;", p = "", p = '<tr data-merchandiseid="" data-asin="' + e.asin + '" data-listing-Id="" data-identifier ="' + e.asin + '" data-keywords="' + findKeywordsFromTitle(e.asinName) + '" data-productType="' + e.pretty_productType.replace(/\s+/g, "_").toLowerCase() + '"data-marketplace="' + e.marketplace_code + '" class="pm-product-container-with-img"><td class="pm-checkbox" style="position:relative"><input type="checkbox" class="magic-checkbox select-row" id="analytics-products-table_' + e.asin + '"/><label style="position:relative" class="" for="analytics-products-table_' + e.asin + '"></label></td><td class="pm-product-row-img-cell text-center" style="padding: 3px;"><div class="pm-product-row-img-container"><img class="pm-product-row-img pm-load-product-img hide-in-screenshot ' + m + '" src="" data-toggle="popover" data-boundary="viewport" data-content="" data-html="true" data-trigger="hover" data-placement="top"></div></td><td style="" class=""><div class="hide-in-screenshot ' + m + '" style=""><a href="' + c + '" target="_blank" title="' + e.asinName + '">' + e.asinName + '</a></div><div class="sub-text hide-in-screenshot ' + m + '" style="" title="Product ASIN">' + (e.hasOwnProperty("formattedAsin") ? e.formattedAsin : e.asin) + '</div></td><td style="" class="light-text">' + e.pretty_productType.replace(/-/gi, "&#8209;") + '</td><td style="" class="text-center"><div class="main-text" style="width: 77px; font-weight: 900">' + e.net_sold + '</div><div class="sub-text" style="" title="Sold - Cancelled">' + e.unitsSold + " - " + e.unitsCancelled + '</div></td><td style="" class="text-center"><div class="main-text" style="width: 46px; ' + (e.unitsReturned > 0 ? "font-weight: bold" : "color: #d1d1d1") + '">' + e.unitsReturned + '</div><div class="sub-text">&nbsp;</div></td><td style="" class="text-center"><div class="main-text ' + royaltiesTaxClass() + '" style="width: 80px; font-weight: 600" title="' + royaltiesTitleText(e.royalties.value, e.currency_symbol) + '">' + e.currency_symbol + parseFloat(e.royalties.value).toFixed(2) + royaltiesTaxIcon() + '</div><div class="sub-text" style="" title="Avg. royalties per sale">' + d + '</div></td><td style=""><div style="min-width: 125px; white-space: nowrap;">' + v + '</div></td><td style=""><div style="width: 140px">' + n + '</div></td><td style="width: 80px;"><div class="clearfix" style=""><img class="table-flag float-left" src="' + chrome.extension.getURL("/assets/img/" + t[e.marketplace_code].marketplace_info.flag_img) + '" title="' + t[e.marketplace_code].marketplace_info.country_name + '"><div class="btn btn-light btn-sm btn-icon float-right edit-product" data-html="true" data-toggle="tooltip" title="Edit" data-identifier="' + e.asin + '"><i class="fa fa-pencil" style=""></i></div></div></td></tr>', !s && !g && t.grand_totals.net_sales > 0 && (b += e.net_sold, _ = b / t.grand_totals.net_sales * 100, 1 == i && (y += e.total_royalties, w = y / q * 100), "desc" == r.sort_order && "sales" == r.sort_by && Math.ceil(_) >= 80 && (p += '<tr><td class="table_info_line" colspan="10"><div class="table_info_line">Products above this line generated <b>' + Math.round(_) + "% of sales</b></div></td></tr>", g = !0), "desc" == r.sort_order && "royalties" == r.sort_by && Math.ceil(w) >= 80 && (p += '<tr><td class="table_info_line" colspan="10"><div class="table_info_line">Products above this line generated <b>' + Math.round(w) + "% of royalties</b></div></td></tr>", g = !0)), se.push(p)
                                                            })), h = "</tbody> </table>"
                                                        } else f = "", p = '<div style="text-align: center; color: #959595; margin-top: 50px;"><div style="font-size: 18px; line-height: 1.4; margin-bottom: 25px;">There are no results for your selection<br/>Try choosing different filters above</div><div style="font-size: 30px;">(゜-゜)</div></div>', h = "", se.push(p);
                                                        var k = "",
                                                            C = se.length > ae ? ae : se.length;
                                                        for (k = f, x = 0; x < C; ++x) k += se[x], ++te;
                                                        se.length > ae && (k += '<tr><td class="table_load_more_line" colspan="10"><div class="table_load_more_line">Load more...</div></td></tr>');
                                                        k += h, d.find(".products-sold-table").html(k), d.find('.products-sold-table [data-toggle="tooltip"]').tooltip(), showProductImages($(".products-sold-table"))
                                                    }

                                                    function le() {
                                                        var e, t = 0;
                                                        $(window).off("scroll").on("scroll", (function() {
                                                            if (document.body.getBoundingClientRect().top > t);
                                                            else if ($("#nav-prettyAnalytics-tab").hasClass("active")) {
                                                                var a = 300;
                                                                $(window).scrollTop() + $(window).innerHeight() > $(".products-sold-table-container").offset().top + $(".products-sold-table-container").height() - a ? (clearTimeout(e), e = setTimeout((function() {
                                                                    re()
                                                                }), 80)) : clearTimeout(e)
                                                            }
                                                            t = document.body.getBoundingClientRect().top
                                                        }))
                                                    }

                                                    function re() {
                                                        var e = se.length - te,
                                                            t = e > ae ? ae : e,
                                                            a = te;
                                                        if (d.find(".products-sold-table table td.table_load_more_line").each((function() {
                                                                $(this).closest("tr").remove()
                                                            })), e > 0) {
                                                            for (x = 0; x < t; ++x) {
                                                                d.find(".products-sold-table table tbody").append(se[a + x]);
                                                                var s = d.find(".products-sold-table table tbody tr").last();
                                                                $(s).find('[data-toggle="tooltip"]').tooltip(), $("#blur_switch").is(":checked") && $(s).find(".hide-in-screenshot").addClass("blur-contents"), ++te
                                                            }
                                                            if (showProductImages($(".products-sold-table")), e > ae) {
                                                                var i = '<tr><td class="table_load_more_line" colspan="10"><div class="table_load_more_line">Load more...</div></td></tr>';
                                                                d.find(".products-sold-table table tbody").append(i)
                                                            }
                                                        }
                                                    }
                                                    ie(F), $(document).off("click", ".products-sold-table th.sortable").on("click", ".products-sold-table th.sortable", (function() {
                                                        var e = $(this),
                                                            t = e.closest("table").closest(".products-sold-table-container"),
                                                            a = e.data("sort-by"),
                                                            s = e.data("sort-order");
                                                        if (e.hasClass("sorted")) s = "desc" == s ? "asc" : "desc";
                                                        else switch (a) {
                                                            case "sales":
                                                            case "returns":
                                                            case "royalties":
                                                                s = "desc";
                                                                break;
                                                            case "title":
                                                            case "product":
                                                                s = "asc";
                                                                break;
                                                            default:
                                                                s = "desc"
                                                        }
                                                        t.data("sort-by", a), t.data("sort-order", s), ie(F)
                                                    })), $(document).off("keyup change", ".products-sold-table-filters input[name=product-search-query]").on("keyup change", ".products-sold-table-filters input[name=product-search-query]", (function(e) {
                                                        var t = $(this),
                                                            a = t.closest(".products-sold-table-container"),
                                                            s = e.keyCode || e.which;
                                                        if (8 == s || 32 == s || 46 == s || s >= 48 && s <= 57 || s >= 65 && s <= 90 || s >= 96 && s <= 105 || s >= 109 && s <= 111 || s >= 186 && s <= 192 || s >= 219 && s <= 222) {
                                                            t.next("i").addClass("show");
                                                            var i = t.val().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                                                            clearTimeout(ee), ee = setTimeout((function() {
                                                                a.data("search-query", i), ie(F), t.next("i").removeClass("show")
                                                            }), 450)
                                                        }
                                                    })), $(document).off("change", ".products-sold-table-filters select").on("change", ".products-sold-table-filters select", (function(e) {
                                                        var t = $(this),
                                                            a = t.closest(".products-sold-table-container"),
                                                            s = t.data("filter"),
                                                            i = t.val();
                                                        a.data("filter-" + s, i), ie(F)
                                                    })), $(document).off("click", ".products-sold-table-filters .clear_filters").on("click", ".products-sold-table-filters .clear_filters", (function(e) {
                                                        var t = $(this).closest(".products-sold-table-container");
                                                        $(".products-sold-table-filters input[name=product-search-query]").val(""), t.data("search-query", ""), $(".products-sold-table-filters select").each((function() {
                                                            var e = $(this).data("filter");
                                                            $(this).val("all"), t.data("filter-" + e, "all")
                                                        })), ie(F)
                                                    })), $(document).off("click", "#nav-prettyAnalytics-tab").on("click", "#nav-prettyAnalytics-tab", (function(e) {
                                                        le()
                                                    })), le(), $(document).off("click", ".products-sold-table div.table_load_more_line").on("click", ".products-sold-table div.table_load_more_line", (function(e) {
                                                        re()
                                                    })), $(".analytics_placeholder").addClass("hidden"), $(".analytics-results-containter .analytics-section:not(.keep-hidden)").removeClass("hidden"), d.find('[data-toggle="tooltip"]').tooltip(), $(".products-sold-table-container").css("min-height", "unset");
                                                    var oe = $(".products-sold-table-container").height(),
                                                        de = document.body.clientHeight;
                                                    oe > de && (oe = de), $(".products-sold-table-container").css("min-height", oe + "px")
                                                }
                                            }))
                                        } else;
                                    })), _this.addClass("initialised")
                                }
                            })), $("#nav-prettyProducts-tab").click((function() {
                                var e = $(this);
                                initFloatingHeader(".manage-products-table-wrapper table", "destroy"), $(document).find(".manage-products-table-wrapper").first().floatingScrollbar(!1), setTimeout((function() {
                                    initFloatingHeader(".manage-products-table-wrapper table", "show"), $(document).find(".manage-products-table-wrapper").first().floatingScrollbar()
                                }), 600), e.hasClass("initialised") || e.addClass("initialised")
                            })), $("#nav-prettyResearch-tab").click((function() {
                                var e = $(this);
                                if (e.hasClass("initialised"));
                                else {
                                    $("#nav-researchTrends").find('[data-toggle="custom-tooltip"]').tooltip({
                                        template: '<div class="tooltip research-tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>'
                                    });
                                    var t = {},
                                        a = 1,
                                        s = 0,
                                        i = !1,
                                        l = {};
                                    chrome.extension.sendMessage({
                                        getAllMarketplacesInfo: !0
                                    }, (function(r) {
                                        l = JSON.parse(JSON.stringify(r.allMarketplaces));
                                        var o = {
                                                COM: "usa",
                                                US: "usa",
                                                UK: "uk",
                                                GB: "uk",
                                                DE: "ger",
                                                FR: "fr",
                                                ES: "es",
                                                IT: "it",
                                                JP: "jp"
                                            },
                                            d = {
                                                SHIRT: "HOUSE_BRAND",
                                                POPSOCKET: "POP_SOCKET",
                                                HOODIE: "STANDARD_PULLOVER_HOODIE",
                                                PHONE: "CELL_PHONE_COVER"
                                            };

                                        function n() {
                                            "pro+" != G_PRO_PLAN && $(".research-trends-filters-container .research-trends-filter .research-trends-filter-option").each((function() {
                                                _this = $(this), _this_available_to = _this.data("available-to"), _this_available_to && "free" == _this_available_to ? _this.addClass("is-default-filter selected") : _this.removeClass("is-default-filter selected").addClass("disabled")
                                            }))
                                        }

                                        function c() {
                                            t = {}, $(".research-trends-filters-row").each((function() {
                                                var e = $(this),
                                                    a = "";
                                                e.find(".research-trends-filter-option").each((function() {
                                                    $(this).hasClass("selected") && (a = $(this).closest(".research-trends-filter").data("filter"), t[a] = $(this).data("value"))
                                                }))
                                            })), t.search_text = $("input[name=research-trends-search-query]").val();
                                            var e = $("#trends_bsr_range").slider("getValue");
                                            t.bsr_range = e
                                        }

                                        function p(e) {
                                            i = !0, e && (s += 1, $("#trends_results .product-thumbnail-container").data("searchid", s), a = 1, toggleLoaderDiv("#trends_results", "show")), $(".research-trends-filters-container .research-trends-apply_filters").html('<i class="fa fa-circle-o-notch fa-spin"></i>SEARCHING'), t.pageNum = a, t.searchId = s, t.userPlan = G_PRO_PLAN, chrome.extension.sendMessage({
                                                researchProducts: "true",
                                                searchVals: t
                                            }, (function(a) {
                                                var s = a?.searchResults ? a.searchResults : {};
                                                if ($("#trends_results .product-thumbnail-container").data("searchid") == s?.searchId)
                                                    if ($(".research-trends-filters-container .research-trends-apply_filters").html('<i class="fa fa-search"></i>SEARCH'), s.items.length) {
                                                        e && (toggleLoaderDiv("#trends_results", "hide"), $("#trends_results .analytics_placeholder").addClass("hidden"), $("#trends_results .product-thumbnail-container").empty(), s.keywordSearch ? $(".product-thumbnail-container_toolbar .view-type-selector .pm_btn[data-view=list]").click() : $(".product-thumbnail-container_toolbar .view-type-selector .pm_btn[data-view=grid]").click());
                                                        var r = "";
                                                        s.items.forEach((function(e) {
                                                            var a = "JP" == e.mp ? e.price : (e.price / 100).toFixed(2),
                                                                i = 0,
                                                                n = 0,
                                                                c = 0,
                                                                p = e.dUrl + "#customerReviews";
                                                            e.hasOwnProperty("reviews") && e.reviews > 0 && (i = parseInt(e.reviews), (n = e.hasOwnProperty("reviewCount") && parseInt(e.reviewCount) > 0 ? parseFloat(parseInt(e.reviewCount) / 10).toFixed(1) : 0) > 0 && (c = n / 5 * 100));
                                                            var v = "";
                                                            e.bullet1 && (G_EXCLUDED_BULLETS.some((t => e.bullet1.toLowerCase().includes(t.toLowerCase()))) || (v += '<div class="product-bullet"><i class="fa fa-circle"></i>' + u(e.bullet1, s.keywordSearch, t.search_type) + "</div>")), e.bullet2 && (G_EXCLUDED_BULLETS.some((t => e.bullet2.toLowerCase().includes(t.toLowerCase()))) || (v += '<div class="product-bullet"><i class="fa fa-circle"></i>' + u(e.bullet2, s.keywordSearch, t.search_type) + "</div>")), v || (v = '<div style="padding: 5px 0 0 20px;">N/A</div>'), r += '<div class="product-thumbnail-item clearfix ' + (e.type ? e.type.toLowerCase() : "") + (e.is_obrand ? " official-brand" : "") + (e.deleted ? " deleted" : "") + '" data-asin="' + e.asin + '" data-product-type="' + d[e.type] + '" data-marketplace="' + t.marketplace + '"><div class="product-thumbnail-item-img">' + (e.imageUrl ? '<img class="quick-view" src="' + m(e.imageUrl) + '" title="Click to Analyze product"/>' : "") + '<div class="link-container"><div class="btn btn-sm btn-primary quick-view" style="margin-right: 6px" data-toggle="tooltip" data-html="true" title="Analyze Product"><i class="fa fa-shield"></i> Analyze</div>' + (e.deleted ? '<a href="' + e.dUrl + '" target="_blank" class="btn btn-sm btn-danger removed-product" data-toggle="tooltip" data-html="true" title="Product has been removed from Amazon"><i class="fa fa-ban"></i></a>' : '<a href="' + e.dUrl + '" target="_blank" class="btn btn-sm btn-warning view-on-amz" data-toggle="tooltip" data-html="true" title="View on Amazon<br/><span>(opens in new tab)</span>"><i class="fa fa-amazon"></i> View</a>') + '</div></div><div class="product-thumbnail-item-details-container"><div class="product-thumbnail-item-text-container top"><div class="product-thumbnail-item-text-container product-title" title="' + e.title + '">' + (e.is_obrand ? '<i class="fa fa-registered official-brand-icon"></i>' : "") + u(e.title, s.keywordSearch, t.search_type) + "</div>" + (e.brand ? '<div class="product-thumbnail-item-text-container product-brand">' + u(e.brand, s.keywordSearch, t.search_type) + "</div>" : "") + '<div class="product-thumbnail-item-text-container link-container clearfix"><div class="btn btn-sm btn-primary quick-view" style="margin-right: 6px" data-toggle="tooltip" data-html="true" title="Analyze Product"><i class="fa fa-shield"></i> Analyze</div>' + (e.deleted ? '<a href="' + e.dUrl + '" target="_blank" class="btn btn-sm btn-danger removed-product" data-toggle="tooltip" data-html="true" title="Product has been removed from Amazon"><i class="fa fa-ban mr-0"></i></a>' : '<a href="' + e.dUrl + '" target="_blank" class="btn btn-sm btn-warning view-on-amz" data-toggle="tooltip" data-html="true" title="View on Amazon<br/><span>(opens in new tab)</span>"><i class="fa fa-amazon mr-0"></i> View</a>') + '</div></div><div class="product-thumbnail-item-text-container product-details"><div class="product-bullets"><div class="small_title">Feature Bullets</div>' + (v || "N/A") + '</div><div class="product-thumbnail-item-stats-container clearfix"><div class="product-thumbnail-item-text-container clearfix"><div class="product-asin float-left" style="height:14px"><img src=' + chrome.extension.getURL("/assets/img/" + l[o[e.mp]].flag_img) + ' /><a href="' + e.dUrl + '" target="_blank">' + e.asin.toUpperCase() + '</a></div><div class="product-upload float-left" data-toggle="tooltip" title="Date Uploaded" style="height:15px"><i class="fa fa-cloud-upload"></i> ' + (e.hasOwnProperty("firstDate") && e.firstDate ? moment(e.firstDate).format("MM/DD/YYYY") + '<span class="help-text">(' + moment(e.firstDate).fromNow() + ")</span>" : '<span style="color: #959595">N/A</span>') + '</div></div></div></div><div class="product-thumbnail-item-stats-container clearfix"><div class="product-thumbnail-item-text-container bsr-stats clearfix"><div class="product-thumbnail-item-text-container-left" style="height:14px">' + (e.hasOwnProperty("bsr") && e.bsr > 0 && 5e6 != e.bsr ? '<span class="badge badge-pill badge-info bsr-badge" data-toggle="tooltip" data-html="true" title="BSR: <b>' + numberWithCommas(e.bsr) + '</b><br/><span>Lower is better</span>"><i class="fa fa-hashtag"></i>' + numberWithCommas(e.bsr) + "</span>" : '<span style="color: #959595">N/A</span>') + "</div>" + (e.boost ? '<div class="product-thumbnail-item-text-container-right ' + (e.boost < 0 ? "pm_green-text" : "pm_red-text") + '" data-toggle="tooltip" data-html="true" title="BSR <b>' + (e.boost < 0 ? "decreased" : "increased") + "</b> by " + abbreviateNumber(Math.abs(e.boost)) + "<br/><span>Moved <b>" + (e.boost < 0 ? "up" : "down") + '</b> in search results</span>"><i class="fa fa-' + (e.boost < 0 ? "arrow-up" : "arrow-down") + '"></i>' + abbreviateNumber(Math.abs(e.boost)) + "</div>" : '<div class="product-thumbnail-item-text-container-right"><span style="color: #959595">N/A</span></div>') + '</div><div class="product-thumbnail-item-text-container sales-stats clearfix"><div class="product-thumbnail-item-text-container-left" data-toggle="tooltip" data-html="true" title="Est. sales<br/><span>per month</span>">' + (e.sales && e.sales > 0 ? '<i class="fa fa-shopping-cart"></i>' + numberWithCommas(e.sales) + '<span style="margin: 0 2px;">-</span>' + numberWithCommas(e.sales + Math.floor(6 * Math.random() + 5)) : '<span style="color: #959595">N/A</span>') + '</div><div class="product-thumbnail-item-text-container-right" data-toggle="tooltip" title="Price">' + l[o[t.marketplace.toUpperCase()]].currency_symbol + a + '</div></div><div class="product-thumbnail-item-text-container product-reviews"><div class="review-stars-container clearfix"><div class="review-stars ' + (i > 0 ? "has-reviews" : "") + '"><span style="width: ' + c + '%"></span></div>' + (i > 0 ? '<div style="float:left;line-height:20px;margin-left:2px"><b>' + n + '</b></div><div class="review-numbers" style="margin-left:6px;"><a href="' + p + '" target="_blank" data-toggle="tooltip" title="View Reviews">(' + numberWithCommas(i) + ")</a></div>" : "") + '</div></div></div><div class="hidden hidden-data" style="display:none!important"><div class="cached-data" style="display:none!important">' + JSON.stringify(e) + '</div><div class="fetched-data" style="display:none!important"></div></div></div></div>'
                                                        })), $("#trends_results .product-thumbnail-container").removeClass("hidden").append(r).find('[data-toggle="tooltip"]').tooltip({
                                                            template: '<div class="tooltip research-tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>',
                                                            delay: {
                                                                show: 350,
                                                                hide: 100
                                                            }
                                                        }), s.endOfResults ? ($("#trends_results .table_load_more_line").addClass("hidden"), $("#trends_results .endOfResults").removeClass("hidden"), "pro+" != G_PRO_PLAN && $("#trends_results .research_results_non_pro_plus").removeClass("hidden")) : ($("#trends_results .table_load_more_line").removeClass("hidden").html("Click to load more results..."), $("#trends_results .endOfResults").addClass("hidden"))
                                                    } else e ? (toggleLoaderDiv("#trends_results", "hide"), $("#trends_results .analytics_placeholder").html('Your search did not return any products<div class="no-sales-kaomoji">¯\\_(ツ)_/¯</div>').removeClass("hidden"), $("#trends_results .product-thumbnail-container").addClass("hidden"), $("#trends_results .table_load_more_line").addClass("hidden"), $("#trends_results .endOfResults").addClass("hidden")) : ($("#trends_results .table_load_more_line").addClass("hidden"), $("#trends_results .endOfResults").removeClass("hidden"));
                                                i = !1
                                            }))
                                        }

                                        function m(e) {
                                            var t = e,
                                                a = "",
                                                s = 0;
                                            return e.indexOf("466") > 0 ? (a = t.substr(t.length - 3), s = (t = t.substr(0, t.length - 4)).lastIndexOf("."), t = t.substr(0, s)) : (a = t.substr(t.length - 3), s = t.lastIndexOf("."), t = t.substr(0, s)), t += ".0_AC_UL500_." + a
                                        }

                                        function u(e, t, a) {
                                            var s = e,
                                                i = [];
                                            return t && s && t && ("PHRASE" == a ? i.push(t.trim()) : i = t.split(" "), i.forEach((function(e) {
                                                e = "PHRASE" == a ? e.replace(/()/, "(<[^>]+>)*$1(<[^>]+>)*") : e.replace(/(\s+)/, "(<[^>]+>)*$1(<[^>]+>)*");
                                                var t = new RegExp("(" + e + ")", "gi");
                                                s = (s = s.replace(t, "<mark>$1</mark>")).replace(/(<mark>[^<>]*)((<[^>]+>)+)([^<>]*<\/mark>)/, "$1</mark>$2<mark>$4")
                                            }))), s
                                        }

                                        function v() {
                                            var e, t = 0;
                                            "pro+" == G_PRO_PLAN && $("#nav-prettyResearch-tab").hasClass("active") && $("#nav-researchTrends").hasClass("active") && $(window).off("scroll").on("scroll", (function() {
                                                if (document.body.getBoundingClientRect().top > t);
                                                else if ($("#nav-prettyResearch-tab").hasClass("active") && $("#nav-researchTrends").hasClass("active") && !i) {
                                                    var s = 300;
                                                    $(window).scrollTop() + $(window).innerHeight() > $("#trends_results").offset().top + $("#trends_results").height() - s ? (clearTimeout(e), e = setTimeout((function() {
                                                        $("#trends_results .table_load_more_line").html("<i class='fa fa-circle-o-notch fa-spin'></i> Loading more results..."), a += 1, p(!1)
                                                    }), 100)) : clearTimeout(e)
                                                }
                                                t = document.body.getBoundingClientRect().top
                                            }))
                                        }

                                        function f(e, t) {
                                            if (e) {
                                                var a = $(".product-thumbnail-container .product-thumbnail-item[data-asin=" + e + "]"),
                                                    s = e,
                                                    i = a.data("product-type"),
                                                    r = a.data("marketplace").toUpperCase(),
                                                    d = {
                                                        asin: s,
                                                        product_type: i,
                                                        marketplace_extension: l[o[r]].marketplace_extension
                                                    };
                                                a.find(".hidden-data .fetched-data").first().text() ? t() : h(d, (function(e) {
                                                    t()
                                                }))
                                            } else t()
                                        }

                                        function h(e, t) {
                                            chrome.extension.sendMessage({
                                                fetchProductListingDetails: "true",
                                                product: e
                                            }, (function(a) {
                                                $(".product-thumbnail-container .product-thumbnail-item[data-asin=" + e.asin + "] .hidden-data .fetched-data").first().text(JSON.stringify(a)), t(a)
                                            }))
                                        }

                                        function g(e) {
                                            $("#productListingModal .modal-title .last-updated").addClass("hidden"), $("#productListingModal .modal-header .pm_btn").addClass("disabled"), showModal("#productListingModal");
                                            var t = $(".product-thumbnail-container .product-thumbnail-item[data-asin=" + e + "]"),
                                                a = e,
                                                s = t.data("product-type"),
                                                i = t.data("marketplace").toUpperCase(),
                                                r = l[o[i]].marketplace_extension,
                                                d = t.prev(".product-thumbnail-item").data("asin"),
                                                n = t.next(".product-thumbnail-item").data("asin"),
                                                c = JSON.parse(t.find(".hidden-data .cached-data").first().text()),
                                                p = t.find(".hidden-data .fetched-data").first().text();
                                            p ? u(p = JSON.parse(p)) : (toggleProgressBar("#productListingModal .modal-body", "show", "Fetching Updated Listing Details..."), setTimeout((function() {
                                                updateProgressBar("#productListingModal .modal-body", "75")
                                            }), 350), h({
                                                asin: a,
                                                product_type: s,
                                                marketplace_extension: r
                                            }, (function(e) {
                                                updateProgressBar("#productListingModal .modal-body", "100"), toggleProgressBar("#productListingModal .modal-body", "hide"), u(e)
                                            })));

                                            function u(e) {
                                                var t = "";
                                                e.listing_images[0].product_img ? t = "https://m.media-amazon.com/images/I/" + e.listing_images[0].product_img + "._CLa|2140,2000|" + e.listing_images[0].design_img + "." + e.listing_images[0].img_type + "|0,0,2140,2000+0.0,0.0,2140.0,2000.0_AC_UL800_." + e.listing_images[0].img_type : c.hasOwnProperty("imageUrl") && c.imageUrl && (t = m(c.imageUrl)), $("#productListingModal .modal-header .view-on-amz").attr("href", c.dUrl);
                                                var p = e.name ? e.name : c.title ? c.title : "N/A",
                                                    u = e.brand ? e.brand : c.brand ? c.brand : "N/A",
                                                    v = e.bsr.bsr_val_clean ? e.bsr.bsr_val_clean : c.bsr && 5e6 != c.bsr ? c.bsr : "N/A",
                                                    h = "dogs_page" == e.availability.reason ? "Removed (Dogs page)" : "out_of_stock" == e.availability.reason ? "Out of stock" : "no_size_options" == e.availability.reason ? "Unavailable" : "",
                                                    g = e.price.clean ? l[o[i]].currency_symbol + e.price.clean : !!c.price && l[o[i]].currency_symbol + ("JP" == i ? c.price : (c.price / 100).toFixed(2)),
                                                    b = p + ". " + e.description + ". ",
                                                    _ = "",
                                                    y = [];
                                                e.bullet_points.length ? y = e.bullet_points : c.hasOwnProperty("feature") && Array.isArray(c.feature) && c.feature.length && (c.bullet1 && y.push(c.bullet1), c.bullet2 && y.push(c.bullet2)), (y = y.filter((function(e) {
                                                    return !G_EXCLUDED_BULLETS.some((t => e.toLowerCase().includes(t.toLowerCase())))
                                                }))).forEach((function(e) {
                                                    _ += '<div class="row product-bullet"><div class="col copy-txt"><i class="fa fa-circle feature-bullet-icon"></i>' + e + "</div></div>", b += e + ". "
                                                }));
                                                var x = 0,
                                                    w = 0,
                                                    k = 0,
                                                    C = c.dUrl + "#customerReviews";
                                                e.reviews && e.reviews.num_of_reviews > 0 && (x = e.reviews.num_of_reviews ? e.reviews.num_of_reviews : 0, (w = e.reviews.review_score ? e.reviews.review_score.toFixed(1) : 0) > 0 && (k = w / 5 * 100));
                                                var M = {},
                                                    P = extract_kws(b);
                                                Object.keys(P).forEach((function(e) {
                                                    M[e] = "", P[e].forEach((function(t) {
                                                        M[e] += '<div class="row"><div class="col kw-text copy-txt">' + t.word + '</div><div class="col-auto"><div class="kw-occur" title="Number of occurances">' + t.count + '</div></div><div class="col-auto action-buttons kw-action-buttons"><div class="action-buttons-container clearfix"><div class="action-button" data-toggle="tooltip" title="View on Google Trends"><a href="https://trends.google.com/trends/explore?geo=US&q=' + encodeURIComponent(t.word) + '" target="_blank"><i class="fa fa-search"></i></a></div><div class="action-button action-copy-to-clip" data-toggle="tooltip" title="Copy to clipboard"><i class="fa fa-clone"></i></div></div></div></div>'
                                                    }))
                                                }));
                                                var R = '<div class="container-fluid ' + (c.type ? c.type.toLowerCase() : "") + '" data-asin="' + a + '" data-product-type="' + s + '" data-marketplace-extension="' + r + '"><div class="row" style="margin-top: 4px; position: relative"><div class="goto_btn goto_prev ' + (d ? "" : "hidden") + '" data-toggle="tooltip" title="Previous Product" data-product-asin="' + d + '"><i class="fa fa-arrow-left"></i></div><div class="goto_btn goto_next ' + (n ? "" : "hidden") + '" data-toggle="tooltip" title="Next Product" data-product-asin="' + n + '"><i class="fa fa-arrow-right"></i></div><div class="col-auto" style="width: 380px; position: relative"><div class="product-listing-img" style="background-image: url(' + (t || chrome.extension.getURL("/assets/img/image_placeholder_square.png")) + ')"><div class="enlarge-help-text">Click to zoom-in</div></div></div><div class="col product-listing-summary-container"><div class="row"><div class="col"><div class="title-wrapper"><div class="product-title" title="' + p + '">' + p + '</div><div class="product-brand">Brand: ' + u + '</div></div></div></div><div class="row stats-wrapper"><div class="col"><div class="row stats-row"><div class="col"><div class="stat-container feature-badge best-seller ' + (e.is_best_seller ? "positive pm_green-text" : "inactive") + '">' + (e.is_best_seller ? '<i class="fa fa-trophy"></i>' : '<i class="fa fa-times"></i>') + 'Best Seller</div></div><div class="col"><div class="stat-container feature-badge amz-choice ' + (e.amz_choice ? "positive pm_green-text" : "inactive") + '">' + (e.amz_choice ? '<i class="fa fa-check-circle"></i>' : '<i class="fa fa-times"></i>') + 'Amazon Choice</div></div><div class="col"><div class="stat-container feature-badge amz-choice ' + (c.is_obrand ? "pm_blue-container pm_blue-text" : "inactive") + '">' + (c.is_obrand ? '<i class="fa fa-registered"></i>' : '<i class="fa fa-times"></i>') + 'Official Brand</div></div></div><div class="row stats-row"><div class="col"><div class="stat-container"><div class="small_title">Marketplace</div><div class="market-text" style="background-image: url(' + chrome.extension.getURL("/assets/img/" + l[o[i]].flag_img) + ')">' + l[o[i]].country_name + '<div class="help-text"><a href="' + c.dUrl + '" target="_blank" title="View on Amazon">' + c.asin.toUpperCase() + '</a></div></div></div></div><div class="col"><div class="stat-container"><div class="small_title">Date Uploaded</div>' + (c.hasOwnProperty("firstDate") && c.firstDate ? moment(c.firstDate).format("MM/DD/YYYY") + '<div class="help-text">' + moment(c.firstDate).fromNow() + "</div>" : '<span style="color: #959595">N/A</span>') + '</div></div><div class="col"><div class="stat-container availability ' + ("true" == e.availability.buyable ? "positive pm_green-text" : "negative pm_red-text") + '"><div class="small_title">Availability</div>' + ("true" == e.availability.buyable ? '<i class="fa fa-check"></i>Buyable' : '<i class="fa fa-times"></i>Not Buyable<div class="help-text">' + h + "</div>") + '</div></div></div><div class="row stats-row"><div class="col-8"><div class="stat-container"><div class="small_title">BSR</div>' + ("N/A" != v ? '<i class="fa fa-hashtag" style="margin-right: 2px"></i><span style="font-weight: 600">' + numberWithCommas(v) + "</span>" + (e.bsr.bsr_category ? '<span class="category-text"> in ' + e.bsr.bsr_category + "</span>" : "") : '<span style="color: #959595">N/A</span>') + '</div></div><div class="col-4"><div class="stat-container ' + (c.boost < 0 ? "positive pm_green-text" : "negative pm_red-text") + '"><div class="small_title">BSR Change</div><i class="fa fa-info-circle help-icon" data-toggle="tooltip" data-html="true" title="BSR <b>' + (c.boost < 0 ? "decreased" : "increased") + "</b> by " + abbreviateNumber(Math.abs(c.boost)) + "<br/><span>Moved <b>" + (c.boost < 0 ? "up" : "down") + '</b> in search results</span>"></i>' + (c.boost ? '<i class="fa fa-' + (c.boost < 0 ? "arrow-up" : "arrow-down") + '"></i>' + abbreviateNumber(Math.abs(c.boost)) : '<span style="color: #959595">N/A</span>') + '</div></div></div><div class="row stats-row"><div class="col"><div class="stat-container"><div class="small_title">Price</div>' + (g ? '<span style="font-weight: 600">' + g + "</span>" : '<span style="color: #959595">N/A</span>') + '</div></div><div class="col"><div class="stat-container"><div class="small_title">≈ Sales/Month</div><i class="fa fa-info-circle help-icon" data-toggle="tooltip" title="Approximate sales based on current BSR"></i>' + (c.hasOwnProperty("sales") && c.sales ? '<i class="fa fa-shopping-cart"></i>' + numberWithCommas(c.sales) + '<span style="margin: 0 2px;">-</span>' + numberWithCommas(c.sales + Math.floor(6 * Math.random() + 5)) : '<span style="color: #959595">N/A</span>') + '</div></div><div class="col"><div class="stat-container"><div class="small_title">≈ Lifetime Sales</div><i class="fa fa-info-circle help-icon" data-toggle="tooltip" title="Approximate lifetime sales based on historical BSRs"></i>' + (c.hasOwnProperty("firstDate") && c.firstDate && c.hasOwnProperty("sales") && c.sales ? '<i class="fa fa-shopping-cart"></i>' + numberWithCommas(parseInt(moment().diff(moment(c.firstDate), "days") * (c.sales / 60))) : '<span style="color: #959595">N/A</span>') + '</div></div></div><div class="row stats-row"><div class="col"><div class="stat-container"><div class="small_title">Reviews</div><div class="review-stars-container clearfix"><div class="review-stars ' + (x > 0 ? "has-reviews" : "") + '"><span style="width: ' + k + '%"></span></div>' + (x > 0 ? '<div class="review-numbers"><b>' + w + '</b> - <a href="' + C + '" target="_blank" data-toggle="tooltip" title="View Reviews">' + numberWithCommas(x) + " review" + (1 == x ? "" : "s") + "</a></div>" : "") + '</div></div></div></div></div></div></div></div><div class="row product-texts"><div class="col"><div class="row"><div class="col"><div class="section-title">Product Texts</div></div></div><div class="row"><div class="col"><div class="small_title">Feature Bullets</div><div class="product-bullets">' + (_ || '<span style="color: #959595">N/A</span>') + '</div></div></div><div class="row"><div class="col"><div class="small_title">Description</div><div class="product-description">' + (e.description ? '<div class="row"><div class="col copy-txt">' + e.description + "</div></div>" : '<span style="color: #959595">N/A</span>') + '</div></div></div></div></div><div class="row product-keywords-container"><div class="col"><div class="row"><div class="col"><div class="section-title">Keyword Analysis</div></div></div><div class="row product-keywords-container"><div class="col"><div class="small_title">1 Word</div><div class="product-keywords">' + (M.hasOwnProperty("1_words") && "" != M["1_words"] ? M["1_words"] : '<span style="color: #959595">N/A</span>') + '</div></div><div class="col"><div class="small_title">2 Words</div><div class="product-keywords">' + (M.hasOwnProperty("2_words") && "" != M["2_words"] ? M["2_words"] : '<span style="color: #959595">N/A</span>') + '</div></div><div class="col"><div class="small_title">3 Words</div><div class="product-keywords">' + (M.hasOwnProperty("3_words") && "" != M["3_words"] ? M["3_words"] : '<span style="color: #959595">N/A</span>') + "</div></div></div></div></div>";
                                                $("#productListingModal .modal-title .last-updated").removeClass("hidden"), $("#productListingModal .modal-header .pm_btn").removeClass("disabled"), $("#productListingModal .product-listing").html(R), $("#productListingModal .product-listing [data-toggle='tooltip']").tooltip({
                                                    template: '<div class="tooltip research-tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>'
                                                }), f(n, (function() {
                                                    f(d, (function() {}))
                                                }))
                                            }
                                        }
                                        $("#trends_bsr_range").slider({}).on("slide", (function(e) {
                                            $(".trends_bsr_range_text > span").text(0 == numberWithCommas(e.value[0]) ? 1 : numberWithCommas(e.value[0])), $(".trends_bsr_range_text > span + span").text(numberWithCommas(e.value[1]))
                                        })), $("#collapse_trend_filters").on("hidden.bs.collapse", (function() {
                                            $(".research-trends-collapse_filters").html('<i class="fa fa-chevron-down"></i>More Filters')
                                        })), $("#collapse_trend_filters").on("shown.bs.collapse", (function() {
                                            $(".research-trends-collapse_filters").html('<i class="fa fa-chevron-up"></i>Less Filters')
                                        })), n(), $(document).off("click", ".research-trends-clear_filters").on("click", ".research-trends-clear_filters", (function(e, t) {
                                            $(".research-trends-filters-row").each((function() {
                                                var e = $(this);
                                                e.find(".research-trends-filter").data("filter");
                                                e.find(".research-trends-filter-option").each((function() {
                                                    $(this).closest(".research-trends-filter").data("filter-style"), $(this).hasClass("is-default-filter") && $(this).click(), n()
                                                }))
                                            })), $("input[name=research-trends-search-query]").val(""), $("#trends_bsr_range").slider("refresh");
                                            var a = $("#trends_bsr_range").slider("getValue");
                                            $(".trends_bsr_range_text > span").text(numberWithCommas(a[0])), $(".trends_bsr_range_text > span + span").text(numberWithCommas(a[1]))
                                        })), $(document).off("click", ".product-thumbnail-container_toolbar .view-type-selector .pm_btn").on("click", ".product-thumbnail-container_toolbar .view-type-selector .pm_btn", (function(e, t) {
                                            var a = $(this).closest(".view-type-selector"),
                                                s = $(this).data("view");
                                            "list" == s ? $("#trends_results .product-thumbnail-container").addClass("details-view") : $("#trends_results .product-thumbnail-container").removeClass("details-view"), a.find(".pm_btn").each((function() {
                                                $(this).data("view") == s ? $(this).addClass("selected") : $(this).removeClass("selected")
                                            }))
                                        })), $(document).off("click", ".research-trends-filter .research-trends-filter-option").on("click", ".research-trends-filter .research-trends-filter-option", (function(e, t) {
                                            var a = "",
                                                s = "",
                                                i = "";
                                            i = (s = (a = $(e.target).hasClass("dropdown-item") || $(e.target).closest(".dropdown-item").length > 0 ? $(e.target).closest(".dropdown-item") : $(e.target).hasClass("pm_btn") ? $(e.target) : $(e.target).closest(".pm_btn")).closest(".research-trends-filter")).data("filter-style");
                                            var l = s.data("filter");
                                            if (a.text(), !a.hasClass("disabled")) {
                                                if ("sort_by" == l) {
                                                    var r = a.data("order-description").split(",");
                                                    $(".research-trends-filter[data-filter='sort_direction']").find(".research-trends-filter-option").each((function(e) {
                                                        $(this).html('<div class="title">' + r[e] + "</div>")
                                                    })), $(".research-trends-filter[data-filter='sort_direction']").find(".dropdown-item[data-value=" + a.data("default-order") + "]").first().click()
                                                }
                                                if ("marketplace" == l) {
                                                    var o = $(this).data("available-products").split(",");
                                                    $(".research-trends-filter[data-filter='product']").find(".research-trends-filter-option").each((function() {
                                                        var e = $(this).data("value");
                                                        o.indexOf(e) >= 0 ? $(this).removeClass("disabled") : ($(this).addClass("disabled"), $(this).removeClass("active selected"))
                                                    })), $(".research-trends-filter[data-filter='product']").find(".research-trends-filter-option.selected").length <= 0 && $(".research-trends-filter[data-filter='product'] .research-trends-filter-option").not(".disabled").first().addClass("active selected")
                                                }
                                                s.find(".research-trends-filter-option").each((function() {
                                                    $(this).removeClass("active selected")
                                                })), a.addClass("active selected"), "dropdown" == i && s.prev(".dropdown-toggle").find(".dropdown-label").text(a.find(".title").first().text())
                                            }
                                        })), $(document).off("keyup change", ".research-trends-filters-container input[name=research-trends-search-query]").on("keyup change", ".research-trends-filters-container input[name=research-trends-search-query]", (function(e) {
                                            var t = $(this),
                                                a = e.keyCode || e.which,
                                                s = t.val();
                                            isAsin(s) ? ($(".research-trends-filter[data-filter='search_in']").find(".research-trends-filter-option").each((function() {
                                                $(this).removeClass("selected")
                                            })), $(".research-trends-filter[data-filter='search_in'] .research-trends-filter-option[data-value='asin']").first().addClass("selected")) : $(".research-trends-filter[data-filter='search_in'] .research-trends-filter-option[data-value='asin']").first().hasClass("selected") && ($(".research-trends-filter[data-filter='search_in']").find(".research-trends-filter-option").each((function() {
                                                $(this).removeClass("selected")
                                            })), $(".research-trends-filter[data-filter='search_in'] .research-trends-filter-option[data-value='title']").first().addClass("selected")), 13 != a && 27 != a || (27 == a ? t.val("") : (s = s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""), c(), p(!0)))
                                        })), $(document).off("click", ".research-trends-apply_filters").on("click", ".research-trends-apply_filters", (function(e, t) {
                                            c(), p(!0)
                                        })), $(document).off("click", "#nav-prettyResearch-tab").on("click", "#nav-prettyResearch-tab", (function(e) {
                                            v()
                                        })), $(document).off("click", "#trends_results .table_load_more_line").on("click", "#trends_results .table_load_more_line", (function(e) {
                                            $(this).html("<i class='fa fa-circle-o-notch fa-spin'></i> Loading more results..."), p(!1)
                                        })), $(document).off("click", ".product-listing .product-listing-img").on("click", ".product-listing .product-listing-img", (function(e) {
                                            $(this).toggleClass("zoomed")
                                        })), $(document).off("click", 'a[data-toggle="tooltip"], [data-toggle="tooltip"] a').on("click", 'a[data-toggle="tooltip"], [data-toggle="tooltip"] a', (function(e) {
                                            $(this).blur()
                                        })), $(document).off("click", ".product-listing .action-button.action-copy-to-clip").on("click", ".product-listing .action-button.action-copy-to-clip", (function(e) {
                                            var t = $(this),
                                                a = t.closest(".row").find(".copy-txt").text().trim();
                                            navigator.clipboard.writeText(a), t.attr("title", "Copied").tooltip("dispose").tooltip().tooltip("show"), setTimeout((function() {
                                                t.attr("title", "Copy to clipboard").tooltip("dispose").tooltip()
                                            }), 3e3)
                                        })), $(document).off("click", ".product-thumbnail-item .quick-view").on("click", ".product-thumbnail-item .quick-view", (function(e) {
                                            $("#productListingModal .product-listing").html(""), g($(this).closest(".product-thumbnail-item").data("asin"))
                                        })), $(document).off("click", "#productListingModal .goto_prev, #productListingModal .goto_next").on("click", "#productListingModal .goto_prev, #productListingModal .goto_next", (function(e) {
                                            $(this).tooltip("dispose"), g($(this).data("product-asin"))
                                        })), c(), p(!0), v();
                                        var b = {};

                                        function _() {
                                            "pro+" != G_PRO_PLAN && ($(".research-trademark-filters-container input[name=research-trademark-search-query]").val("adidas").prop("disabled", !0), $(".research-trademark-filters-container .research-trademark-filter .research-trademark-filter-option").each((function() {
                                                _this = $(this), _this_available_to = _this.data("available-to"), _this_available_to && "free" == _this_available_to ? _this.addClass("is-default-filter selected") : _this.removeClass("is-default-filter selected").addClass("disabled")
                                            })))
                                        }

                                        function y() {
                                            var e = $(".research-trademark-filters-container input[name=research-trademark-search-query]"),
                                                t = e.val().replace(/\s+/g, " ").trim(),
                                                a = !1;
                                            return (t = t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")) ? (e.removeClass("is-invalid"), a = !0) : (e.addClass("is-invalid").focus(), a = !1), a
                                        }

                                        function x() {
                                            b = {}, $(".research-trademark-filters-row").each((function() {
                                                var e = $(this),
                                                    t = "";
                                                e.find(".research-trademark-filter-option").each((function() {
                                                    $(this).hasClass("selected") && (t = $(this).closest(".research-trademark-filter").data("filter"), b[t] = $(this).data("value"))
                                                }))
                                            })), b.search_query = $("input[name=research-trademark-search-query]").val().replace(/\s+/g, " ").trim(), b.match_whole_words = $("#match-whole-words-checkbox").prop("checked")
                                        }

                                        function w() {
                                            "pro+" != G_PRO_PLAN && _(), x(), y() && ($(".research-trademark-filters-container .research-trademark-apply_filters").html('<i class="fa fa-circle-o-notch fa-spin"></i>SEARCHING'), b.userPlan = G_PRO_PLAN, chrome.extension.sendMessage({
                                                trademarkSearch: "true",
                                                searchVals: b
                                            }, (function(e) {
                                                $(".research-trademark-filters-container .research-trademark-apply_filters").html('<i class="fa fa-search"></i>SEARCH');
                                                var t = e.searchResults;
                                                if (t.results.all && t.results.all.length) {
                                                    var a = '<div class="trademark-result-count" style="margin-bottom: 5px;"><span class="total-results"><span class="number">' + (500 == t.results.all.length ? "500+" : t.results.all.length) + "</span> result" + (1 == t.results.all.length ? "" : "s") + " found</span></div>",
                                                        s = '<table class="table shirts-list template-full pm-table-hover trademark-search"><thead><tr><th scope="col" style="width:50px">&nbsp;</th><th scope="col" style="width:120px">Status</th><th scope="col" style="width:340px">Trademark</th><th scope="col" style="width:230px">Applicant</th><th scope="col" style="width:200px">Nice Class</th><th scope="col" style="width:100px">Filed</th><th scope="col" style="width:100px">Registered</th><th scope="col" style="width:50px">&nbsp;</th></tr></thead><tbody>';
                                                    t.results.all.forEach((function(e) {
                                                        var t = [{
                                                                number: "25",
                                                                description: "T-Shirts"
                                                            }, {
                                                                number: "9",
                                                                description: "PopSockets"
                                                            }, {
                                                                number: "20",
                                                                description: "Pillow Cases"
                                                            }, {
                                                                number: "18",
                                                                description: "Tote Bags"
                                                            }],
                                                            a = e.niceclass ? e.niceclass.split(",") : [],
                                                            i = "";
                                                        t.forEach((function(e) {
                                                            i += '<div class="pm_badge pm_badge_light_blue nice_class_badge ' + (a.includes(e.number) ? "active" : "disabled") + '" data-toggle="tooltip" title="' + (a.includes(e.number) ? e.description : "") + '">' + e.number + "</div>", a.includes(e.number) && a.splice(a.indexOf(e.number), 1)
                                                        })), i += '<div class="pm_badge pm_badge_light_blue nice_class_badge ' + (a.length > 0 ? "active" : "disabled") + '" style="font-weight: bold" data-toggle="tooltip" data-html="true" title="' + (a.length > 0 ? "Other Nice Classes:<br/>" + a.join(", ") : "") + '">+</div>';
                                                        var r = "",
                                                            d = "",
                                                            n = "",
                                                            c = "";
                                                        switch (e.tmoffice) {
                                                            case "WO":
                                                                e.registrationnumber && (d = "https://www.wipo.int/madrid/monitor/en/showData.jsp?ID=ROM." + e.registrationnumber, n = e.registrationnumber), c = "WIPO - World Intellectual Property Organization", r = chrome.extension.getURL("/assets/img/flag_WORLD_256_min.png");
                                                                break;
                                                            case "EM":
                                                                e.registrationnumber && (d = "https://euipo.europa.eu/eSearch/#details/trademarks/" + e.registrationnumber, n = e.registrationnumber), c = "EUIPO - European Union Intellectual Property Office", r = chrome.extension.getURL("/assets/img/flag_EU_256_min.png");
                                                                break;
                                                            case "US":
                                                                e.applicationnumber && (d = "http://tsdr.uspto.gov/#caseNumber=" + e.applicationnumber + "&caseType=SERIAL_NO&searchType=statusSearch", n = e.applicationnumber), c = "USPTO - United States Patent and Trademark Office", r = chrome.extension.getURL("/assets/img/" + l[o[e.tmoffice]].flag_img);
                                                                break;
                                                            case "GB":
                                                                e.registrationnumber && (d = "https://trademarks.ipo.gov.uk/ipo-tmcase/page/Results/1/" + e.registrationnumber, n = e.registrationnumber), c = "IPO - Intellectual Property Office", r = chrome.extension.getURL("/assets/img/" + l[o[e.tmoffice]].flag_img);
                                                                break;
                                                            case "DE":
                                                                e.applicationnumber && (d = "https://register.dpma.de/DPMAregister/marke/register/" + e.applicationnumber + "/DE", n = e.applicationnumber), c = "DPMA - Deutsches Patent und Markenamt", r = chrome.extension.getURL("/assets/img/" + l[o[e.tmoffice]].flag_img);
                                                                break;
                                                            case "FR":
                                                                e.applicationnumber && (d = "https://bases-marques.inpi.fr/Typo3_INPI_Marques/marques_fiche_resultats.html?index=1&refId=" + e.applicationnumber, n = e.applicationnumber), c = "INPI - Institut National de la Propriété Industrielle", r = chrome.extension.getURL("/assets/img/" + l[o[e.tmoffice]].flag_img);
                                                                break;
                                                            case "IT":
                                                                e.st13 && (d = "https://www.tmdn.org/tmview/#/tmview/detail/" + e.st13, n = e.st13), c = "UIBM - Italian Patent and Trademark Office", r = chrome.extension.getURL("/assets/img/" + l[o[e.tmoffice]].flag_img);
                                                                break;
                                                            case "ES":
                                                                e.applicationnumber && (d = "https://www.oepm.es/en/signos_distintivos/resultados_expediente.html?mod=" + e.applicationnumber.substr(0, 1) + "&exp=" + e.applicationnumber.substr(1, e.applicationnumber.length) + "&bis=", n = e.applicationnumber), c = "OEPM - Oficina Española de Patentes y Marcas", r = chrome.extension.getURL("/assets/img/" + l[o[e.tmoffice]].flag_img);
                                                                break;
                                                            default:
                                                        }
                                                        s += '<tr><td><img class="table-flag" data-toggle="tooltip" title="' + c + '" src=' + r + " /></td><td>" + (e.trademarkstatus ? '<div class="pm_badge ' + ("registered" == e.trademarkstatus.toLowerCase() ? "pm_badge_red" : "pm_badge_orange") + '">' + e.trademarkstatus + "</div>" : "") + "</td><td>" + (d ? '<a class="trademark-title" href="' + d + '" target="_blank" title="' + e.tmname + '" style="width: fit-content; max-width: 315px;">' + u(e.tmname, b.search_query, b.search_type) + "</a>" : '<span title="' + e.tmname + '">' + u(e.tmname, b.search_query, b.search_type) + "</span>") + (n ? '<span class="sub-text" title="Application Number">' + n + "</span>" : "") + "</td><td>" + e.applicantname + '</td><td><div class="nice-classes clearfix">' + i + "</div></td><td>" + (e.applicationdate ? moment(e.applicationdate).format("MM/DD/YYYY") : "") + "</td><td>" + (e.registrationdate ? moment(e.registrationdate).format("MM/DD/YYYY") : "") + '</td><td class="actions"><a class="btn btn-light btn-sm btn-icon ' + (d ? "" : " disabled") + '" href="' + d + '" target="_blank" data-toggle="tooltip" title="Open in new tab"><i class="fa fa-external-link"></i></a></td></tr>'
                                                    })), s += "</tbody></table>", $("#trademark_results .analytics_placeholder").text("Select filters and click Search").addClass("hidden"), $("#trademark_results .trademark-table-container").html(a + s).removeClass("hidden").find('[data-toggle="tooltip"]').tooltip(), $("#trademark_results .endOfResults").removeClass("hidden")
                                                } else $("#trademark_results .analytics_placeholder").text('No results found for "' + b.search_query + '"').removeClass("hidden"), $("#trademark_results .trademark-table-container").html("").addClass("hidden"), $("#trademark_results .endOfResults").addClass("hidden")
                                            })))
                                        }
                                        $("#nav-researchTrademarks").find('[data-toggle="custom-tooltip"]').tooltip({
                                            template: '<div class="tooltip research-tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>'
                                        }), $(document).off("click", "#nav-researchTrademarks-tab").on("click", "#nav-researchTrademarks-tab", (function(e, t) {
                                            setTimeout((function() {
                                                $(".research-trademark-filters-container input[name=research-trademark-search-query]").first().focus()
                                            }), 500)
                                        })), $(document).off("click", ".research-trademark-clear_filters").on("click", ".research-trademark-clear_filters", (function(e, t) {
                                            $(".research-trademark-filters-row").each((function() {
                                                var e = $(this);
                                                e.find(".research-trademark-filter").data("filter");
                                                e.find(".research-trademark-filter-option").each((function() {
                                                    $(this).closest(".research-trademark-filter").data("filter-style"), "pro+" == G_PRO_PLAN ? $(this).hasClass("is-default-filter") && $(this).click() : "free" == $(this).data("available-to") && $(this).click()
                                                }))
                                            })), $("input[name=research-trademark-search-query]").val(""), $("#match-whole-words-checkbox").prop("checked", !0)
                                        })), $(document).off("click", ".research-trademark-filter .research-trademark-filter-option").on("click", ".research-trademark-filter .research-trademark-filter-option", (function(e, t) {
                                            var a = $(this);
                                            _filter = a.closest(".research-trademark-filter"), filter_style = _filter.data("filter-style");
                                            _filter.data("filter");
                                            data_value_str = a.text(), a.hasClass("disabled") || (_filter.find(".research-trademark-filter-option").each((function() {
                                                $(this).removeClass("active selected")
                                            })), a.addClass("active selected"), "dropdown" == filter_style && _filter.prev(".dropdown-toggle").find(".dropdown-label").text(a.find(".title").first().text()))
                                        })), $(document).off("keyup change", ".research-trademark-filters-container input[name=research-trademark-search-query]").on("keyup change", ".research-trademark-filters-container input[name=research-trademark-search-query]", (function(e) {
                                            var t = $(this),
                                                a = e.keyCode || e.which;
                                            t.val().replace(/\s+/g, " ").trim();
                                            13 != a && 27 != a || (27 == a ? t.val("") : w())
                                        })), $(document).off("click", ".research-trademark-apply_filters").on("click", ".research-trademark-apply_filters", (function(e, t) {
                                            w()
                                        })), _(), e.addClass("initialised")
                                    }))
                                }
                            }))
                        }(), chrome.extension.sendMessage({
                            initApp: "prettyDash"
                        })
                }))
            }))
        }))
    })) : -1 != window.location.pathname.indexOf("landing") || "merch.amazon.com" == window.location.host && (-1 != t.indexOf("merch.amazon.com/resource") ? init_nav_menu() : (init_nav_menu(), wait_for_app_container_to_load((function() {
        chrome.extension.sendMessage({
            initApp: "otherPage"
        })
    }))))
})), document.onreadystatechange = function() {
    switch (chrome.extension.sendMessage({
            show_in_bg_log: "true",
            msg: moment().format("HH:mm:ss") + " document.readyState = " + document.readyState
        }), document.readyState) {
        case "loading":
            break;
        case "interactive":
            var e = window.location.href;
            if (-1 != window.location.host.indexOf("www.amazon.com") && -1 != window.location.href.indexOf("signin") && -1 != window.location.href.indexOf("merch.amazon.com") && -1 != window.location.href.indexOf("autoReLogin")) {
                function t() {
                    onmessage = function(e) {
                        setTimeout((function() {
                            postMessage("go")
                        }), 100)
                    }
                }
                window != self && t();
                var a = new Worker(URL.createObjectURL(new Blob(["(" + t.toString() + ")()"], {
                    type: "text/javascript"
                })));
                a.postMessage(0), chrome.extension.sendMessage({
                    show_in_bg_log: "true",
                    msg: moment().format("HH:mm:ss") + " Creating test_worker"
                }), a.onmessage = function(e) {
                    chrome.extension.sendMessage({
                        show_in_bg_log: "true",
                        msg: moment().format("HH:mm:ss") + " Running test_worker"
                    }), chrome.extension.sendMessage({
                        loaded_auto_re_login: "true"
                    }, (function(e) {
                        chrome.extension.sendMessage({
                            show_in_bg_log: "true",
                            msg: moment().format("HH:mm:ss") + " Login page Received message from bg"
                        })
                    }))
                }, a.onerror = function(e) {
                    chrome.extension.sendMessage({
                        show_in_bg_log: "true",
                        msg: "test_worker got en error " + e.data
                    })
                }
            }
            break;
        case "complete":
            if (-1 != (e = window.location.href).indexOf("merch.amazon.com") && -1 != e.indexOf("designs") && -1 != e.indexOf("edit") && -1 != e.indexOf("pm_prod")) {
                function s() {
                    onmessage = function(e) {
                        setTimeout((function() {
                            postMessage("go")
                        }), 100)
                    }
                }
                window != self && s();
                var i = new Worker(URL.createObjectURL(new Blob(["(" + s.toString() + ")()"], {
                    type: "text/javascript"
                })));
                i.postMessage(0), i.onmessage = function(e) {
                    trigger_click_on_target_product()
                }, i.onerror = function(e) {
                    chrome.extension.sendMessage({
                        show_in_bg_log: "true",
                        msg: "trigger_product_worker got en error " + e.data
                    })
                }
            }
            break
    }
};