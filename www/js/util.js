document.addEventListener("deviceready", onDeviceReady, false);

// function handleOpenURL(url) {
// console.log("received url: " + url);
// }

function onDeviceReady() {
    myApp.showIndicator();
    // StatusBar.overlaysWebView(false);
    // StatusBar.backgroundColorByHexString('#3399FF');
    // StatusBar.styleLightContent();

    // window.plugins.intent.getCordovaIntent(function (Intent) {
    //     console.log(Intent);
    // }, function () {
    //     console.log('Error');
    // });


   // universalLinks.subscribe('handleOnLoadEvents', function (eventData) {
    //     console.log(eventData.url);
    //     console.log('Did launch application from the link: ' + eventData.url);
    // });

    // function handleOnLoadEvents(url) {
    //     console.log("received url: " + url);
    // }

    var push = PushNotification.init({
        "android": {
            "senderID": "836033005549"
        },
        "browser": {},
        "ios": {
            "sound": true,
            "vibration": true,
            "badge": true
        },
        "windows": {}
    });

    push.on('registration', function(data) {
        oldPushId = Lockr.get('push_key');
        if (oldPushId !== data.registrationId) {
            Lockr.set('push_key', data.registrationId);
            // Save new registration ID
            // Post registrationId to your app server as the value has changed
        }
    });

    push.on('error', function(e) {
        console.log(e);
        // myApp.alert("push error = " + e.message);
    });

    push.on('notification', function(data) {
        console.log(data);
        if (!data.additionalData.foreground) {
            if (data.additionalData.notification_for == 'Profile') {
                if (data.additionalData.related_user_id == token.id) {
                    goto_profile();
                } else {
                    goto_user_page(data.additionalData.feed_id);
                }
            } else if (data.additionalData.notification_for == 'Feed') {
                load_feed_page(data.additionalData.feed_id);
            } else if (data.additionalData.notification_for == 'Become Parent') {
                goto_becomeParentDetails(data.additionalData.feed_id);
            } else if (data.additionalData.notification_for == 'Find Parent') {
                goto_chat_inner(data.additionalData.user_id);
            } else if (data.additionalData.notification_for == 'Business Profile') {
                goto_business_page(data.additionalData.feed_id);
            } else if (data.additionalData.notification_for == 'Pet Profile') {
                goto_profile_shopper_pet(data.additionalData.feed_id);
            } else if (data.additionalData.notification_for == 'Lost and Found') {
                goto_chat_inner(data.additionalData.user_id);
            } else if (data.additionalData.notification_for == 'Mating') {
                goto_chat_inner(data.additionalData.user_id);
            } else if (data.additionalData.notification_for == 'Adoption') {
                goto_chat_inner(data.additionalData.user_id);
            }
        }
    });

    setInterval(function(){
        $.ajax({
            url: base_url + 'get_counts',
            type: 'POST',
            crossDomain: true,
            data: {
                user_id: token.id,
            }
        }).done(function(res){
            if (res.status == 'Success') {
                if (res.response.chat_count < 1) {
                    $(".dynamic_messagecount").html('');
                } else {
                    $(".dynamic_messagecount").html(res.response.chat_count);
                }

                if (res.response.notification_count < 1) {
                    $(".dynamic_notificationcount").html('');
                } else {
                    $(".dynamic_notificationcount").html(res.response.notification_count);
                }

            } else {
                $(".dynamic_messagecount").html('');
            }
        }).error(function(res){
        })
    }, 1000);

    // window.BackgroundService.start(
    //     function(fn) { console.log(fn) },
    //     function() { console.log('err') }
    // );

    // cordova.plugins.backgroundMode.enable();

    // window.plugins.PushbotsPlugin.initialize("5c657b160540a312147d5764", {"android":{"sender_id":"836033005549"}});

    // Only with First time registration
    // window.plugins.PushbotsPlugin.on("registered", function(data){
    //     console.log(data);
    //     oldPushId = Lockr.get('push_key');
    //     if (oldPushId !== data) {
    //         Lockr.set('push_key', data);
    //         // Save new registration ID
    //         // localStorage.setItem('registrationId', data.registrationId);
    //         // Post registrationId to your app server as the value has changed
    //     }
    // });

    // //Get user registrationId/token and userId on PushBots, with evey launch of the app even launching with notification
    // window.plugins.PushbotsPlugin.on("user:ids", function(data){
    //     console.log("user:ids" + JSON.stringify(data));
    // });

    user_data = token;
    if (token === undefined) {
        myApp.hideIndicator();
        goto_page('index.html');
    } else {
        $.ajax({
            url: base_url+ 'store_push_key',
            type: 'POST',
            crossDomain: true,
            data: { user_id: token.id, push_id: Lockr.get('push_key'), device_type: 'IOS' },
        }).done(function(res){
            if (res.status == 'Success') {
            } else {
            }
        }).error(function(res){
        })

        account_default_id = user_data.id;

        if (user_data.user_type == 'User') {
            myApp.hideIndicator();
            mainView.router.load({
                url: 'feeds.html',
                query: {
                    id: token
                },
                ignoreCache: true,
            });
        } else {
            myApp.hideIndicator();
            mainView.router.load({
                url: 'feeds.html',
                query: {
                    id: token
                },
                ignoreCache: true,
            });
        }
    }

    document.addEventListener("backbutton", function(e) {
        e.preventDefault();
        var page = myApp.getCurrentView().activePage;
        myApp.hideIndicator();
        image_from_device = '';
        if (page.name == "feeds" || page.name == "index") {
            myApp.confirm('Are you sure you want to exit the app?', function() {
                navigator.app.clearHistory();
                navigator.app.exitApp();
            });
        } else {
            mainView.router.back({});
        }
    }, false);
}

function j2s(json) {
    return JSON.stringify(json);
}

function goto_page(page) {
    mainView.router.load({
        url: page,
        ignoreCache: true,
    });
}

function goto_before_add_account() {
    mainView.router.load({
        url: 'before_add_account.html',
        ignoreCache: true,
    });
}

function make_call(number) {
    window.open('tel:' + number);
}

function sendEmail() {
    myApp.alert('Email has been sent to the Business Page Successfully!');
    $(".close-popup").click();

    // cordova.plugins.email.open({
    //     to:      $(".business_email_to").data('businessemail'),
    //     cc:      'petattoo@gmail.com',
    //     subject: 'Enquiry From Pettato User',
    // });

    // myApp.modalLogin('Contact Business', function (contact_info, details) {
    //     // myApp.alert('Thank you! Username: ' + username + ', Password: ' + password);
    //     console.log(details);
    //     console.log(contact_info);
    //     return false;
    // });

    // window.open('mailto:' + $(".business_email_to").data('businessemail'));
}

function locatioRoute() {
    // directions.navigateTo("51.50722", "-0.12750");
    // window.open('email:' + $(".business_email_to").html());
    // directions.navigateTo($(".business_email_to").data('businesslat'), $(".business_email_to").data('businesslong'));
}

function logout() {
    Lockr.flush();
    token = false;
    mainView.router.load({
        url: 'index.html',
        ignoreCache: false,
    });
}

function load_city(selecter, callBack) {
    myApp.showIndicator();
    $.ajax({
        url: base_url + 'get_city_master',
        type: 'POST',
        crossDomain: true,
        async: false,
        data: {},
    })
    .done(function(res) {
        myApp.hideIndicator();
        if (res.status == 'Success') {
            html = '<option value="">Select City</option>';
            $.each(res.response, function(index, val) {
                html += '<option value="' + val.id + '" >' + val.city + '</option>';
            });
            $(selecter).append(html);
            callBack();
        } else {}
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always();
}

function load_category(selector, afterCallback) {
    myApp.showIndicator();
    $.ajax({
        url: base_url + 'get_category',
        type: 'POST',
        crossDomain: true,
        async: false,
        data: {},
    })
    .done(function(res) {
        myApp.hideIndicator();
        if (res.status == 'Success') {
            var html = '<option value="">Select Category</option><option value="Type Your Own">Type Your Own</option>';
            $.each(res.response, function(index, val) {
                html += '<option value="' + val.id + '" >' + val.category_name + '</option>';
            });
            $(selector).html(html);
            afterCallback();
        } else {
        }
    })
    .fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always();
}

function load_pet_categories(dropdown_id, callBack) {
    $.ajax({
        url: base_url + 'get_pet_type_list',
        type: 'POST',
        crossDomain: true,
    }).done(function(res){
        var html = '';
        if (res.status == 'Success') {
            html = '<option value="">Select Pet Type</option><option value="Type Your Own">Type Your Own</option>';
            $.each(res.response, function(index, value){
                html += '<option value="'+value.id+'">'+value.pet_type+'</option>';
            })
        }
        $(dropdown_id).html(html);

        callBack();
    }).error(function(res){
        $(dropdown_id).html('');
    })
}

function load_breed_dropdown(dropdown_value, dropdown_id, callBack) {
    $.ajax({
        url: base_url + 'get_breeds_list',
        type: 'POST',
        crossDomain: true,
        data: {
            pet_type: dropdown_value,
        }
    }).done(function(res){
        var html = '';
        if (res.status == 'Success') {
            html = '<option value="">Select Breed</option><option value="Type Your Own">Type Your Own</option>';
            $.each(res.response, function(index, value) {
                html += '<option value="'+value.id+'">'+value.breed+'</option>';
            })
        }
        $(dropdown_id).html(html);
        callBack();
    }).error(function(res){
        $(dropdown_id).html('');
    })
}

function initialize(disp_lat, disp_lng, canvas) {
    var mapOptions = {
        center: new google.maps.LatLng(disp_lat, disp_lng),
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var geocoder = new google.maps.Geocoder();
    var infoWindow = new google.maps.InfoWindow();
    var latlngbounds = new google.maps.LatLngBounds();
    var map = new google.maps.Map(document.getElementById(canvas), mapOptions);

    if (lat) {
        if (lng) {
            var myLatLng = {lat: lat, lng: lng};

            var map = new google.maps.Map(document.getElementById(canvas), {
                zoom: 17,
                center: myLatLng
            });

            var marker = new google.maps.Marker({
                position: myLatLng,
                map: map,
                draggable: true,
                title: 'Business Location'
            });

            marker.addListener('click', toggleBounce);

            google.maps.event.addListener(marker, 'dragend', function (e) {
                lat = e.latLng.lat();
                lng = e.latLng.lng();
                $("#business_register-lat, #edit_business_register-lat, #business_register_add-lat").val(lat);
                $("#edit_business_register-lng, #business_register-lng, #business_register_add-lng").val(lng);

                geocoder.geocode({'location': {lat: lat, lng: lng}}, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        if (results[0]) {
                            $("#business_register-address, #edit_business_register-address, #business_register_add-address").val(results[0].formatted_address);
                        } else {
                            myApp.alert('No results found');
                        }
                    } else {
                        myApp.alert('Geocoder failed due to: ' + status);
                    }
                });
            });
        }
    }

    google.maps.event.addListener(map, 'click', function (e) {
        lat = e.latLng.lat();
        lng = e.latLng.lng();
        $("#business_register-lat, #edit_business_register-lat, #business_register_add-lat").val(lat);
        $("#edit_business_register-lng, #business_register-lng, #business_register_add-lng").val(lng);

        geocoder.geocode({'location': {lat: lat, lng: lng}}, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                    $("#business_register-address, #edit_business_register-address, #business_register_add-address").val(results[0].formatted_address);
                } else {
                    myApp.alert('No results found');
                }
            } else {
                myApp.alert('Geocoder failed due to: ' + status);
            }
        });
        initialize('19.113645', '72.869734', 'mapCanvas');
    });
}

function toggleBounce() {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }
}

/* camera functionality */

// selection for image upload type
function open_dialog_for_image(type) {
    image_upload_type = type;
    var buttons1 = [{
        text: 'choose source',
        label: true
    }, {
        text: 'Camera',
        bold: true,
        onClick: image_camera,
    }, {
        text: 'Gallery',
        bold: true,
        onClick: image_gallery,
    }];
    var buttons2 = [{
        text: 'Cancel',
        color: 'red'
    }];
    var groups = [buttons1, buttons2];
    myApp.actions(groups);
}

// on Selection of camera
function image_camera() {
    // var img_width = 500;
    // var img_height = 500;
    // if (image_upload_type == 'pet_profile' || image_upload_type == 'user_profile' || image_upload_type == 'business_profile') {
    //     img_width = 720;
    //     img_height = 640;
    // } else if (image_upload_type == 'feed_image') {
    //     img_width = 500;
    //     img_height = 500;
    // } else {
    //     img_width = 720;
    //     img_width = 500;
    // }

    navigator.camera.getPicture(shopper_register_onSuccess, shopper_register_onFail, {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.CAMERA,
        correctOrientation: true,
        allowEdit: false,
    });
}

// on Selection of gallery
function image_gallery() {
    // var img_width = 500;
    // var img_height = 500;
    // if (image_upload_type == 'pet_profile' || image_upload_type == 'user_profile' || image_upload_type == 'business_profile') {
    //     img_width = 720;
    //     img_height = 640;
    // } else if (image_upload_type == 'feed_image') {
    //     img_width = 500;
    //     img_height = 500;
    // } else {
    //     img_width = 720;
    //     img_width = 500;
    // }

    navigator.camera.getPicture(shopper_register_onSuccess, shopper_register_onFail, {
        quality: 100,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
        correctOrientation: true,
        allowEdit: false,
    });
}

// image selection success function
function shopper_register_onSuccess(fileURL) {
    plugins.crop(onCropSuccess, onCropfail, fileURL, { quality: 100, targetWidth: 1000, targetHeight: 1000 });
}

function onCropSuccess(fileURL) {
    var uri = encodeURI(base_url + "upload_user");
    var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
    options.mimeType = "image/jpeg";
    var headers = {
        'headerParam': 'headerValue'
    };
    options.headers = headers;
    new FileTransfer().upload(fileURL, uri, shopper_register_onSuccess_file, shopper_register_onError_file, options);
}

function onCropfail(message) {
    myApp.alert('Failed because: ' + message);
}

// image selection Fail function
function shopper_register_onFail(message) {
    myApp.alert('Failed because: ' + message);
}

// image upload success function
function shopper_register_onSuccess_file(res) {
    myApp.hidePreloader();
    if (res.responseCode == 200) {
        uploaded_image = res.response.replace(/\"/g, "");
        if (image_upload_type == 'pet_profile') {
            profile_image_link = uploaded_image;
        } else if (image_upload_type == 'pet_cover') {
            profile_cover_image_link = uploaded_image;
        } else if (image_upload_type == 'user_profile') {
            profile_image_link = uploaded_image;
        } else if (image_upload_type == 'user_cover') {
            profile_cover_image_link = uploaded_image;
        } else if (image_upload_type == 'business_profile') {
            profile_image_link = uploaded_image;
        } else if (image_upload_type == 'business_cover') {
            profile_cover_image_link = uploaded_image;
        } else {
            feed_image_upload = uploaded_image;
            $(".CNGDynImg").attr('src', image_url+feed_image_upload);
        }

        myApp.alert("Image Uploaded Successfully");
    } else {
        myApp.hidePreloader();
        myApp.alert('Some error occurred on uploading');
    }
}

// image upload fail function
function shopper_register_onError_file(error) {
    myApp.hidePreloader();
    myApp.alert("Some Error Occured While image upload please try again");
}

/* camera functionality */

function continue_btn_signin() {
    if (!token == false) {
        myApp.showIndicator();
        $.ajax({
            url: base_url + 'get_user',
            type: 'POST',
            crossDomain: true,
            data: {
                user_id: token.id
            },
        })
        .done(function(res) {
            myApp.hideIndicator();
            if (res.status = 'success') {
                user_data = res.data;
                mainView.router.load({
                    url: 'feeds.html',
                    ignoreCache: true,
                });
            } else {
                mainView.router.load({
                    url: 'login.html',
                    ignoreCache: true,
                });
            }
        }).fail(function(err) {
            myApp.hideIndicator();
            myApp.alert('Some error occurred!');
        }).always();
    } else {
        myApp.hideIndicator();
        mainView.router.load({
            url: 'login.html',
            ignoreCache: true,
        });
    }
}

function continue_btn_signup() {
    if (!token == false) {
        myApp.showIndicator();
        $.ajax({
            url: base_url + 'get_user',
            type: 'POST',
            crossDomain: true,
            data: {
                user_id: token.id
            },
        })
        .done(function(res) {
            myApp.hideIndicator();
            if (res.status = 'success') {
                user_data = res.data;
                mainView.router.load({
                    url: 'feeds.html',
                    ignoreCache: false,
                });
            } else {
                mainView.router.load({
                    url: 'before_register.html',
                    ignoreCache: false,
                });
            }
        }).fail(function(err) {
            myApp.hideIndicator();
            myApp.alert('Some error occurred');
        }).always();
    } else {
        mainView.router.load({
            url: 'before_register.html',
            ignoreCache: false,
        });
    }
}

function goto_register(type) {
    myApp.showIndicator();
    if (type == 'shopper') {
        mainView.router.load({
            url: 'shopper_register.html',
            ignoreCache: true,
        });
    } else {
        mainView.router.load({
            url: 'business_register_add.html',
            ignoreCache: true,
        });
    }
}

function login() {
    var email = $('#login-username').val().trim();
    var password = $('#login-password').val().trim();
    if (email == '') {
        myApp.alert('Please enter email id');
        return false;
    }

    if (password == '') {
        myApp.alert('Please enter password');
        return false;
    }

    myApp.showIndicator();
    $.ajax({
        url: base_url + 'login',
        type: 'POST',
        crossDomain: true,
        data: {
            identity: email,
            password: password,
            push_id: Lockr.get('push_key'),
        },
    })
    .done(function(res) {
        myApp.hideIndicator();
        if (res.status == 'success') {
            Lockr.set('token', res.response);
            token = res.response;
            user_data = res.response;
            account_default_id = user_data.id;
            mainView.router.load({
                url: 'feeds.html',
                ignoreCache: true,
            });
        } else {
            myApp.alert(res.api_msg);
        }
    })
    .fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Some error occured while processing your request, Please try again later.');
    })
    .always(function() {});
}

function register_shopper() {
    var name = $('#shopper_register-name').val().trim();
    var username = $('#shopper_register-username').val().trim();
    var email = $('#shopper_register-email').val().trim();
    var password = $('#shopper_register-password').val().trim();
    var confirm_password = $('#shopper_register-confirm_password').val().trim();
    var city_id = $('#shopper_register-city_select').val();
    var profile_image = profile_image_link.trim();

    if (name == '') {
        myApp.alert('Please enter name');
        return false;
    }

    if (username == '') {
        myApp.alert('Please enter username');
        return false;
    }

    if (email == '') {
        myApp.alert('Please enter email id');
        return false;
    }

    if (!email.match(email_regex)) {
        myApp.alert('Please enter valid email id');
        return false;
    }

    if (password == '') {
        myApp.alert('Please enter password');
        return false;
    }

    if (confirm_password == '') {
        myApp.alert('Please confirm password');
        return false;
    }

    if (password!=confirm_password) {
        myApp.alert('Password does not match');
        return false;
    }

    if (city_id == '') {
        myApp.alert('Please select city');
        return false;
    }

    if (!profile_image) {
        myApp.alert('Please Upload Profile Picture!');
        return false;
    }

    myApp.showIndicator();
    $.ajax({
        url: base_url + 'create_user',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            first_name: name,
            username: username,
            email: email,
            password: password,
            city_id: city_id,
            medium: 'register',
            user_type: 'User',
            profile_image: profile_image,
            push_id: Lockr.get('push_key'),
        },
    }).done(function(res) {
        myApp.hideIndicator();
        if (res.status == 'success') {
            Lockr.set('token', res.response);
            token = res.response;
            user_data = res.response;
            account_default_id = user_data.id;
            mainView.router.load({
                url: 'feeds.html',
                ignoreCache: true,
                query: {
                    register: true
                },
            });
        } else {
            myApp.alert(res.api_msg);
        }
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Some error occured while processing your request, Please try again later.');
    }).always(function() {
    });
}

function register_business() {
    var username = $('#business_register-username').val().trim();
    var business_name = $('#business_register-buissness').val().trim();
    var category = $('#business_register-category').val();
    var email = $('#business_register-email').val().trim();
    var phone = $('#business_register-phone').val().trim();
    var password = 'pass';
    var confirm_password = 'pass';
    var city_id = $('#business_register-city_select').val().trim();
    var address = $('#business_register-address').val().trim();
    var profile_image = profile_image_link;
    var business_category = '';
    var new_category = '';

    if (username == '') {
        myApp.alert('Please provide username.');
        return false;
    }
    if (business_name == '') {
        myApp.alert('Please provide business name.');
        return false;
    }
    if (!category) {
        if (!$("#business_register-categoryInput").val()) {
            myApp.alert('Please select category.');
            return false;
        } else {
            category = $("#business_register-categoryInput").val();
            new_category = $("#business_register-categoryInput").val();
        }
    } else if (category == 'Type Your Own') {
        if (!$("#business_register-categoryInput").val()) {
            myApp.alert('Please enter category!');
            return false;
        } else {
            category = $("#business_register-categoryInput").val();
            new_category = $("#business_register-categoryInput").val();
        }
    }
    if (email == '') {
        myApp.alert('Please provide email id.');
        return false;
    }
    if (phone == '') {
        myApp.alert('Please enter phone number.');
        return false;
    }
    if (!phone.match(phone_regex)) {
        myApp.alert('Please enter valid phone number.');
        return false;
    }
    if (!email.match(email_regex)) {
        myApp.alert('Please provide valid email id.');
        return false;
    }
    if (password == '') {
        myApp.alert('Please provide password.');
        return false;
    }
    if (confirm_password == '') {
        myApp.alert('Please confirm password.');
        return false;
    }
    if (!password == confirm_password) {
        myApp.alert('Password mismatch.');
        return false;
    }
    if (city_id == '') {
        myApp.alert('Please provide city.');
        return false;
    }
    if (!address) {
        myApp.alert('Please provide location.');
        return false;
    }

    if (!profile_image) {
        myApp.alert('Please provide profile picture.');
        return false;
    }

    // business_category = business_category.slice(0, -1);

    myApp.showIndicator();
    $.ajax({
        url: base_url + 'create_business',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            linked_acc: token.id,
            username: username,
            business_name: business_name,
            email:email,
            first_name: 'Business',
            password: password,
            category: category.toString(),
            city_id: city_id,
            address: address,
            medium: 'register',
            user_type: 'Business',
            phone: phone,
            new_category: new_category,
            profile_image: profile_image,
        },
    }).done(function(res) {
        myApp.hideIndicator();
        if (res.status == 'success') {
            account_id = res.response.id;
            business_static_account_id = res.response.id;
            mainView.router.load({
                url: 'feeds.html',
                ignoreCache: true,
                query: {
                    register: true
                },
            });
        } else {
            myApp.alert(res.api_msg);
        }
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Some error occured while processing your request, Please try again later.');
    }).always(function() {
    });
}

function register_pet() {
    var name = $("#pet_register-name").val();
    // var username = $("#pet_register-username").val();
    var pettype = $("#pet_register-pettype").val();
    var breed = $("#pet_register-breed").val();
    var age = $("#pet_register-age").val();
    // var description = $("#pet_register-description").val();
    var description = '';
    var city = $("#pet_register-city").val();
    // var profile_btn = profile_image_link;
    var gender = $('input[name=pet_register-gender]:checked').val();
    var cover_btn = profile_cover_image_link;
    var new_pettype = '';
    var new_breed = '';

    if (!name) {
        myApp.alert("Please provide Pet Name");
        return false;
    }

    // if (!username) {
    //     myApp.alert("Please provide Pet Username");
    //     return false;
    // }

    if (!pettype) {
        if (!$("#pet_register-pettypetypeown").val()) {
            myApp.alert('Please enter Pet Type.');
            return false;
        } else {
            pettype = $("#pet_register-pettypetypeown").val();
            new_pettype = $("#pet_register-pettypetypeown").val();
        }
    } else if (pettype == 'Type Your Own') {
        if (!$("#pet_register-pettypetypeown").val()) {
            myApp.alert('Please enter Pet Type.');
            return false;
        } else {
            pettype = $("#pet_register-pettypetypeown").val();
            new_pettype = $("#pet_register-pettypetypeown").val();
        }
    }

    if (!breed) {
        if (!$("#pet_register-breedtypeown").val()) {
            myApp.alert('Please enter Breed.');
            return false;
        } else {
            breed = $("#pet_register-breedtypeown").val();
            new_breed = $("#pet_register-breedtypeown").val();
        }
    } else if (breed == 'Type Your Own') {
        if (!$("#pet_register-breedtypeown").val()) {
            myApp.alert('Please enter Breed.');
            return false;
        } else {
            breed = $("#pet_register-breedtypeown").val();
            new_breed = $("#pet_register-breedtypeown").val();
        }
    }

    if (!age) {
        myApp.alert("Please provide Pet Age");
        return false;
    }

    if (!city) {
        myApp.alert("Please provide City");
        return false;
    }

    if (!gender) {
        myApp.alert("Please select Gender");
        return false;
    }

    // if (!profile_btn) {
    //     myApp.alert("Please provide Pet Profile Image");
    //     return false;
    // }

    if (!cover_btn) {
        myApp.alert("Please provide Pet Cover Image");
        return false;
    }

    // if (!description) {
    //     myApp.alert("Please provide Pet Description");
    //     return false;
    // }

    $.ajax({
        url: base_url + 'upload_pet_profile',
        type: 'post',
        crossDomain: true,
        data: {
            name: name,
            username: name,
            pettype: pettype,
            breed: breed,
            new_pettype: new_pettype,
            new_breed: new_breed,
            age: age,
            gender: gender,
            city: city,
            profile_btn: cover_btn,
            cover_btn: cover_btn,
            parent_user_id: token.id,
            description: description,
        }
    }).done(function(res){
        if (res.status == 'Success') {
            account_id = res.response;
            pet_static_account_id = res.response;
            goto_page('profile_shopper_pet.html');
        } else {
            myApp.alert(res.api_msg);
            return false;
        }
    }).error(function(res){
        myApp.alert("Some Error Occured while processing the request, Please try again later");
        return false;
    })
}

function upload_business() {
    var name = $("#business_register_add-name").val();
    var username = $("#business_register_add-username").val();
    var buissness_name = $("#business_register_add-buissness").val();
    var category = $("#business_register_add-category").val();
    var email = $("#business_register_add-email").val();
    var phone = $("#business_register_add-phone").val();
    var city_id = $("#business_register_add-city_select").val();
    var address = $("#business_register_add-address").val();
    var lat_add = $("#business_register_add-lat").val();
    var lng_add = $("#business_register_add-lng").val();
    var description = $("#business_register_add-description").val();
    var profile_image = profile_image_link;
    var cover_image = profile_cover_image_link;

    var business_category = '';
    // var profile_image = image_from_device.trim();

    if (name == '') {
        myApp.alert('Please provide name.');
        return false;
    }
    if (username == '') {
        myApp.alert('Please provide username.');
        return false;
    }
    if (buissness_name == '') {
        myApp.alert('Please provide business name.');
        return false;
    }
    if (!category) {
        myApp.alert('Please select category.');
        return false;
    }
    if (email == '') {
        myApp.alert('Please provide email id.');
        return false;
    }
    if (phone == '') {
        myApp.alert('Please provide email id.');
        return false;
    }
    if (!phone.match(phone_regex)) {
        myApp.alert('Please enter valid phone number.');
        return false;
    }
    if (!email.match(email_regex)) {
        myApp.alert('Please provide valid email id.');
        return false;
    }
    if (city_id == '') {
        myApp.alert('Please provide city.');
        return false;
    }
    if (!address) {
        myApp.alert('Please provide location.');
        return false;
    }

    if (!profile_image) {
        myApp.alert('Please provide Profile Picture.');
        return false;
    }

    if (!cover_image) {
        myApp.alert('Please provide Cover Picture.');
        return false;
    }

    if (!description) {
        myApp.alert('Please provide Description.');
        return false;
    }

    // business_category = business_category.slice(0, -1);

    myApp.showIndicator();
    $.ajax({
        url: base_url + 'upload_business',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            username: username,
            business_name: buissness_name,
            email:email,
            first_name: name,
            category: category,
            city_id: city_id,
            address: address,
            lat: lat_add,
            lng: lng_add,
            user_type: 'Business',
            phone: phone,
            parent_user_id: token.id,
            profile_image: profile_image,
            cover_image: cover_image,
            description: description,

        },
    }).done(function(res) {
        myApp.hideIndicator();
        if (res.status == 'Success') {
            profile_goto_id = res.response;
            goto_page('profile_business_sub.html');
        } else {
            myApp.alert(res.api_msg);
        }
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Some error occured while processing your request, Please try again later.');
    }).always(function() {
    });
}

function loadIssueFeeds() {
    myApp.showIndicator();

    console.log('Function Actionables');

    var tabs_active = 0;

    $.ajax({
        url: base_url+'abuses',
        type: 'POST',
        data: {
            user_id: token.id,
        },
    }).done(function(res){
        var html = '';
        var feed_type = 'Feeds';

        if (res.status == 'Success') {
            $.each(res.response, function(index, value) {
                var share_image_link = image_url+value.image;
                var share_image_title = decodeURI(value.feeds_content).substring(0, 50);
                html += '<div class="card c_ard ks-facebook-card">'+
                        '<div class="black_overlay"></div>'+
                        '<a href="#" class="card-header no-border pro_view">'+
                        '<div class="ks-facebook-avatar pro_pic">'+
                        '<img src="'+image_url+value.profile_image+'" width="34" height="34" class="lazy lazy-fadeIn">'+
                        '</div>';
                if (value.user_type == 'Business') {
                    html += '<div class="ks-facebook-name pro_name" onclick="goto_business_page('+value.user_id+')">'+value.first_name+'</div>';
                } else {
                    html += '<div class="ks-facebook-name pro_name" onclick="goto_user_page('+value.user_id+')">'+value.first_name+'</div>';
                }
                html += '<div class="ks-facebook-date pro_tag">'+share_image_title+'</div>'+
                        '<div class="ks-facebook-date pro_tag">'+value.feed_comment_count+' Comments</div>'+
                        '</a>'+
                        '<a class="card-content" onclick="load_abuse_feed_page('+value.feed_id+');" href="javascript:void(0)">'+
                        '<img data-src="'+share_image_link+'" width="100%" class="feedImg lazy lazy-fadeIn lazy-fadein" src="img/lazyload.jpg">'+
                        // '<img data-src="'+share_image_link+'" width="100%" class="lazy lazy-fadeIn">'+
                        '</a>'+
                        '<div class="card-footer no-border like_share" style="width: 17%">'+
                        '<a href="javascript:void(0);"><i onclick="issueFeedShareStatusChng('+value.feed_id+')" data-title="'+share_image_title+'" data-image_link="'+share_image_link+'" class="share_feeds_'+value.feed_id+' material-icons white_heart white_heart_bubble bg_grren1" style="font-size:20px !important;">share</i></a>';

                // if (value.user_type == 'User') {
                //     html += '<a href="javascript:void(0);" style="opacity: 0;" class="shr_lnk" onclick="goto_chat_inner('+value.user_id+');"><i class="material-icons white_heart white_heart_bubble bg_grren2" style="font-size:20px !important;">comment</i></a>';
                // } else {
                //     html += '<a href="javascript:void(0);" style="opacity: 0;" class="shr_lnk" onclick="goto_chat_inner('+value.linked_acc_id+');"><i class="material-icons white_heart white_heart_bubble bg_grren2" style="font-size:20px !important;">comment</i></a>';
                // }
                // html += '<a href="javascript:void(0);" style="opacity: 0;" class="shr_lnk" onclick="chngSaveStatus('+value.feed_id+');"><i class="material-icons white_heart white_heart_bubble bg_grren3" style="font-size:20px !important;">save</i></a>'+
                //         '<a href="javascript:void(0);" class="add_clk" style="z-index: 999"><i class="material-icons white_heart">add_circle</i></a>';

                // if (value.like_status == 1) {
                //     html += '<a href="javascript:void(0);" data-liked="0" onclick="chngLikeStatus('+value.feed_id+');" class="like_block_chng_active'+value.feed_id+'"><i class="material-icons white_heart white_heart_active">favorite</i></a>';
                // } else {
                //     html += '<a href="javascript:void(0);" data-liked="0" onclick="chngLikeStatus('+value.feed_id+');" class="like_block_chng_active'+value.feed_id+'"><i class="material-icons white_heart white_heart_active">favorite_border</i></a>';
                // }

                html += '</div>'+
                        '</div>';
            });

            $("#issues_feeds-container").append(html);

            // $('.feedImg').trigger('lazy');

            $(".add_clk").click(function(e) {
                e.preventDefault();
                if (tabs_active == 0) {
                    tabs_active = 1;
                    $(".shr_lnk").css('opacity', 0);
                    $(".shr_lnk").css('top', 0);

                    $(this).prev(".shr_lnk").animate({
                        top: '-=65%',
                        opacity: 1,
                    });

                    $(this).prev(".shr_lnk").prev(".shr_lnk").animate({
                        top: '-=145%',
                        opacity: 1,
                    });

                    $(this).prev(".shr_lnk").prev(".shr_lnk").prev(".shr_lnk").animate({
                        top: '-=230%',
                        opacity: 1,
                    });
                } else {
                    tabs_active = 0;
                    $(".shr_lnk").animate({opacity: 0, top: '0px'});
                }
            });

            // $(".feedImg").each(function(){
            //     $(this).attr('src', $(this).data('src'));
            // })

            $.each($(".feedImg"), function(){
                $(this).attr('src', $(this).data('src'));
            })

            $(".feedImg").lazy();

            myApp.hideIndicator();
        } else {
            myApp.hideIndicator();
        }
    }).error(function(res){
        myApp.hideIndicator();
    })
}

function add_abuse_feed() {
    var feed_image = feed_image_upload.trim();
    var description = encodeURI($('#create_abuse_feed-description').val().trim());
    var location_id = '1';
    var post_create_id = 0;

    if (feed_image == '') {
        myApp.alert('Please upload image.');
        return false;
    }
    if (description == '') {
        myApp.alert('Please provide description.');
        return false;
    }
    if (!location_id) {
        myApp.alert('Please select location.');
        return false;
    }

    myApp.showIndicator();
    $.ajax({
        url: base_url+'get_users_business_acc',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: token.id,
        }
    }).done(function(res){
        var json_data = [];
        if (res.status == 'Success') {
            $.each(res.response, function(index, value){
                post_create_id = value.id;
                json_data.push({text: '@'+value.username, onClick: function() { create_abuse_feed(value.id, feed_image, description, location_id); }});
            })

            myApp.hideIndicator();

            myApp.modal({
                verticalButtons: true,
                buttons: json_data
            })
        } else {
            myApp.hideIndicator();
            myApp.alert("Unable to fetch user's list!");
        }
    }).error(function(res){
        myApp.hideIndicator();
        myApp.alert("Unable to fetch user's list!");
    })
}

function create_abuse_feed(post_create_id, feed_image, description, location_id) {
    myApp.showIndicator();
    $.ajax({
        url: base_url + 'create_abuse_feed',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: post_create_id,
            description: description,
            image: feed_image,
            location: location_id,
        },
    }).done(function(res) {
        myApp.hideIndicator();
        if (res.status == 'Success') {
            $(".CNGDynImg").attr('src', 'img/lazyload.jpg');
            mainView.router.load({
                url: 'feeds.html',
                ignoreCache: true,
            });

        } else {
            myApp.alert('Please provide all the details!');
        }
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
    });
}

function loadFeeds() {
    myApp.showIndicator();

    var tabs_active = 0;

    $.ajax({
        url: base_url+'feeds',
        type: 'POST',
        data: {
            user_id: token.id,
        },
    }).done(function(res){
        var html = '';
        var feed_type = 'Feeds';

        if (res.status == 'Success') {
            $.each(res.response, function(index, value) {
                var share_image_link = image_url+value.image;
                var share_image_title = decodeURI(value.feeds_content).substring(0, 50);
                html += '<div class="card c_ard ks-facebook-card">'+
                        '<div class="black_overlay"></div>'+
                        '<a href="#" class="card-header no-border pro_view">'+
                        '<div class="ks-facebook-avatar pro_pic">'+
                        '<img src="'+image_url+value.profile_image+'" width="34" height="34" class="lazy lazy-fadeIn">'+
                        '</div>';
                if (value.user_type == 'Business') {
                    html += '<div class="ks-facebook-name pro_name" onclick="goto_business_page('+value.user_id+')">'+value.first_name+'</div>';
                } else {
                    html += '<div class="ks-facebook-name pro_name" onclick="goto_user_page('+value.user_id+')">'+value.first_name+'</div>';
                }
                html += '<div class="ks-facebook-date pro_tag">'+share_image_title+'</div>'+
                        '<div class="ks-facebook-date pro_tag">'+value.feed_comment_count+' Comments '+value.likes_count+' Likes</div>'+
                        '</a>'+
                        '<a class="card-content" onclick="load_feed_page('+value.feed_id+');" href="javascript:void(0)">'+
                        '<img data-src="'+share_image_link+'" width="100%" class="feedImg lazy lazy-fadeIn lazy-fadein" src="img/lazyload.jpg">'+
                        // '<img data-src="'+share_image_link+'" width="100%" class="lazy lazy-fadeIn">'+
                        '</a>'+
                        '<div class="card-footer no-border like_share">'+
                        '<a href="javascript:void(0);" style="opacity: 0;" class="shr_lnk"><i onclick="feedShareStatusChng('+value.feed_id+')" data-title="'+share_image_title+'" data-image_link="'+share_image_link+'" class="share_feeds_'+value.feed_id+' material-icons white_heart white_heart_bubble bg_grren1" style="font-size:20px !important;">share</i></a>';

                if (value.user_type == 'User') {
                    html += '<a href="javascript:void(0);" style="opacity: 0;" class="shr_lnk" onclick="goto_chat_inner('+value.user_id+');"><i class="material-icons white_heart white_heart_bubble bg_grren2" style="font-size:20px !important;">comment</i></a>';
                } else {
                    html += '<a href="javascript:void(0);" style="opacity: 0;" class="shr_lnk" onclick="goto_chat_inner('+value.linked_acc_id+');"><i class="material-icons white_heart white_heart_bubble bg_grren2" style="font-size:20px !important;">comment</i></a>';
                }
                html += '<a href="javascript:void(0);" style="opacity: 0;" class="shr_lnk" onclick="chngSaveStatus('+value.feed_id+');"><i class="material-icons white_heart white_heart_bubble bg_grren3" style="font-size:20px !important;">save</i></a>'+
                        '<a href="javascript:void(0);" class="add_clk" style="z-index: 999"><i class="material-icons white_heart">add_circle</i></a>';

                if (value.like_status == 1) {
                    html += '<a href="javascript:void(0);" data-liked="0" onclick="chngLikeStatus('+value.feed_id+');" class="like_block_chng_active'+value.feed_id+'"><i class="material-icons white_heart white_heart_active">favorite</i></a>';
                } else {
                    html += '<a href="javascript:void(0);" data-liked="0" onclick="chngLikeStatus('+value.feed_id+');" class="like_block_chng_active'+value.feed_id+'"><i class="material-icons white_heart white_heart_active">favorite_border</i></a>';
                }

                html += '</div>'+
                        '</div>';
            });

            $("#feeds-container").append(html);

            // $('.feedImg').trigger('lazy');

            $(".add_clk").click(function(e) {
                e.preventDefault();
                if (tabs_active == 0) {
                    tabs_active = 1;
                    $(".shr_lnk").css('opacity', 0);
                    $(".shr_lnk").css('top', 0);

                    $(this).prev(".shr_lnk").animate({
                        top: '-=65%',
                        opacity: 1,
                    });

                    $(this).prev(".shr_lnk").prev(".shr_lnk").animate({
                        top: '-=145%',
                        opacity: 1,
                    });

                    $(this).prev(".shr_lnk").prev(".shr_lnk").prev(".shr_lnk").animate({
                        top: '-=230%',
                        opacity: 1,
                    });
                } else {
                    tabs_active = 0;
                    $(".shr_lnk").animate({opacity: 0, top: '0px'});
                }
            });

            // $(".feedImg").each(function(){
            //     $(this).attr('src', $(this).data('src'));
            // })

            $.each($(".feedImg"), function(){
                $(this).attr('src', $(this).data('src'));
            })

            $(".feedImg").lazy();

            myApp.hideIndicator();
        } else {
            myApp.hideIndicator();
        }
    }).error(function(res){
        myApp.hideIndicator();
    })
}

function feedLikeStatusChng() {
    var feed_id = $('.feedDetailsLike').data('feed_id');
    chngLikeStatus(feed_id);
}

function findParentLikeStatusChng(feed_id) {
    chngLikeStatusFindP(feed_id);
}

function chngLikeStatusFindP(feed_id) {
    $.ajax({
        url: base_url+'like_feeds',
        type: 'POST',
        crossDomain: true,
        data: {
            user_id: token.id,
            feed_id: feed_id,
            feed_type: "Find Parent",
        },
    }).done(function(res) {
        if (res.status == 'Success') {
            if (res.response.like_status == 0) {
                $(".like_block_chng_active"+res.response.category_id).html('<i class="material-icons white_heart color_8ac640 findParentLike" onclick="findParentLikeStatusChng('+res.response.category_id+')" data-feed_id="'+res.response.category_id+'">favorite_border</i>');
            } else {
                $(".like_block_chng_active"+res.response.category_id).html('<i class="material-icons white_heart white_heart_active findParentLike" onclick="findParentLikeStatusChng('+res.response.category_id+')" data-feed_id="'+res.response.category_id+'">favorite</i>');
            }
        } else {
            myApp.alert(res.api_msg);
        }
    }).error(function(res) {
        myApp.alert("Some error occured, please try again later!");
    }).always(function(res) {
    })
}

function chngLikeStatus(feed_id) {
    $.ajax({
        url: base_url+'like_feeds',
        type: 'POST',
        crossDomain: true,
        data: {
            user_id: token.id,
            feed_id: feed_id,
            feed_type: "Feed",
        },
    }).done(function(res) {
        if (res.status == 'Success') {
            if (res.response.like_status == 0) {
                $(".feedDetailsLike, .like_block_chng_active"+res.response.category_id).html('<i class="material-icons white_heart white_heart_active">favorite_border</i>');
            } else {
                $(".feedDetailsLike, .like_block_chng_active"+res.response.category_id).html('<i class="material-icons white_heart white_heart_active">favorite</i>');
            }
        } else {
            myApp.alert(res.api_msg);
        }
    }).error(function(res) {
        myApp.alert("Some error occured, please try again later!");
    }).always(function(res) {
    })
}

function chngSaveStatus(feed_id) {
    $.ajax({
        url: base_url+'save_feeds',
        type: 'POST',
        crossDomain: true,
        data: {
            user_id: token.id,
            feed_id: feed_id,
            feed_type: "Feed",
        },
    }).done(function(res) {
        if (res.status == 'Success') {
            myApp.alert("Feed Added to your list!");
        } else {
            myApp.alert(res.api_msg);
        }
    }).error(function(res) {
        myApp.alert("Some error occured, please try again later!");
    }).always(function(res) {
    })
}

function chngSaveStatusBecomeParent() {
    $.ajax({
        url: base_url+'save_status',
        type: 'POST',
        crossDomain: true,
        data: {
            user_id: token.id,
            feed_id: pet_static_account_id,
            feed_type: "Become Parent",
        },
    }).done(function(res) {
        if (res.status == 'Success') {
            myApp.alert("Feed Added to your list!");
        } else {
            myApp.alert(res.api_msg);
        }
    }).error(function(res) {
        myApp.alert("Some error occured, please try again later!");
    }).always(function(res) {
    })
}

function chngSaveStatusFindParent(feed_id) {
    $.ajax({
        url: base_url+'save_status',
        type: 'POST',
        crossDomain: true,
        data: {
            user_id: token.id,
            feed_id: feed_id,
            feed_type: "Find Parent",
        },
    }).done(function(res) {
        if (res.status == 'Success') {
            myApp.alert("Feed Added to your list!");
        } else {
            myApp.alert(res.api_msg);
        }
    }).error(function(res) {
        myApp.alert("Some error occured, please try again later!");
    }).always(function(res) {
    })
}

function load_feed_page(feed_id) {
    feed_details_fetch_id = feed_id;
    mainView.router.load({
        url: 'feed.html',
        ignoreCache: true,
    });
}

function load_abuse_feed_page(feed_id) {
    feed_details_fetch_id = feed_id;
    mainView.router.load({
        url: 'issue_feed.html',
        ignoreCache: true,
    });
}

function sharePetProfile() {
    var title = $(".share_profileButtonhide").data('title');
    var share_image_link = $(".share_profileButtonhide").data('image_link');
    share_feed_id = pet_static_account_id;
    share_feed_type = 'PetProfile';

    myApp.modal({
        title: title,
        text: '<img src="'+share_image_link+'" width="100%;">',
        verticalButtons: true,
        buttons: [
            {
                text: 'Share on Social Media',
                onClick: function() {
                    var options = {
                        message: title,
                        subject: title,
                        files: [share_image_link],
                        url: 'http://pettato.com/?foo=bar',
                        chooserTitle: title,
                        appPackageName: 'com.huzaifrangila.pettato'
                    };

                    var onSuccess = function(result) {
                        // console.log("Share completed? " + result.completed);
                        // console.log("Shared to app: " + result.app);
                    };

                    var onError = function(msg) {
                        // console.log("Sharing failed with message: " + msg);
                        myApp.alert("Sharing failed with message: " + msg);
                    };

                    window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);

                    // window.plugins.socialsharing.share(title, title, share_image_link, '<a href="pettato://somepath?foo=bar">View More</a>', 'Pettato', 'pettato://');
                }
            },
            {
                text: 'Share on Pettato',
                onClick: function() {
                    share_with_freinds(share_image_link, title, share_feed_id, share_feed_type);
                }
            },
            {
                text: 'Cancel',
                onClick: function() {
                    myApp.closeModal();
                }
            },
        ]
    })
}

function shareFindParent(id) {
    var title = $(".checkShareContent"+id).data('sharecontent');
    var share_image_link = '';
    share_feed_id = id;
    share_feed_type = 'Find Parent';

    myApp.modal({
        title: title,
        text: '<img src="'+share_image_link+'" width="100%;">',
        verticalButtons: true,
        buttons: [
            {
                text: 'Share on Social Media',
                onClick: function() {
                    // var options = {
                    //     message: title,
                    //     subject: title,
                    //     files: [share_image_link],
                    //     url: 'http://pettato.com/?foo=bar',
                    //     chooserTitle: title,
                    //     appPackageName: 'com.huzaifrangila.pettato'
                    // };
                    window.plugins.socialsharing.share(title, title, share_image_link, 'pettatoapp://pettato', 'Pettato', 'com.huzaifrangila.pettato');
                    // window.plugins.socialsharing.share(title, title, share_image_link, '');
                    // window.plugins.socialsharing.share(title, title, share_image_link, '<a href="pettato://somepath?foo=bar">View More</a>', 'Pettato', 'pettato://');
                }
            },
            {
                text: 'Share on Pettato',
                onClick: function() {
                    share_with_freinds(share_image_link, title, share_feed_id, share_feed_type);
                }
            },
            {
                text: 'Cancel',
                onClick: function() {
                    myApp.closeModal();
                }
            },
        ]
    })
}

function feedShareStatusChng(id) {
    var title, share_feed_id, share_feed_type, share_image_link = '';
    if (id == 0) {
        title = $(".feedDetailsShare").data('title');
        share_image_link = $(".feedDetailsShare").data('image_link');
        share_feed_id = $(".feedDetailsShare").data('feed_id');
    } else {
        title = $(".share_feeds_"+id).data('title')+'...';
        share_image_link = $(".share_feeds_"+id).data('image_link');
        share_feed_id = id;
    }

    var share_link = 'http://pettato.com';
    share_feed_type = 'Feed';

    myApp.modal({
        title: title,
        text: '<img src="'+share_image_link+'" width="100%;">',
        verticalButtons: true,
        buttons: [
            {
                text: 'Share on Social Media',
                onClick: function() {
                    // window.plugins.socialsharing.share(title, title, share_image_link, '');
                    window.plugins.socialsharing.share(title, title, share_image_link, 'pettatoapp://pettato', 'Pettato', 'com.huzaifrangila.pettato');
                    // window.plugins.socialsharing.share(title, title, share_image_link, '<a href="pettato://somepath?foo=bar">View More</a>', 'Pettato', 'pettato://');
                }
            },
            {
                text: 'Share on Pettato',
                onClick: function() {
                    share_with_freinds(share_image_link, title, share_feed_id, share_feed_type);
                }
            },
            {
                text: 'Cancel',
                onClick: function() {
                    myApp.closeModal();
                }
            },
        ]
    })
}

function issueFeedShareStatusChng(id) {
    var title, share_feed_id, share_feed_type, share_image_link = '';
    if (id == 0) {
        title = $(".feedDetailsShare").data('title');
        share_image_link = $(".feedDetailsShare").data('image_link');
        share_feed_id = $(".feedDetailsShare").data('feed_id');
    } else {
        title = $(".share_feeds_"+id).data('title')+'...';
        share_image_link = $(".share_feeds_"+id).data('image_link');
        share_feed_id = id;
    }

    var share_link = 'http://pettato.com';
    share_feed_type = 'Abuse Feed';

    myApp.modal({
        title: title,
        text: '<img src="'+share_image_link+'" width="100%;">',
        verticalButtons: true,
        buttons: [
            {
                text: 'Share on Social Media',
                onClick: function() {
                    // window.plugins.socialsharing.share(title, title, share_image_link, '');
                    window.plugins.socialsharing.share(title, title, share_image_link, 'pettatoapp://pettato', 'Pettato', 'com.huzaifrangila.pettato');
                    // window.plugins.socialsharing.share(title, title, share_image_link, '<a href="pettato://somepath?foo=bar">View More</a>', 'Pettato', 'pettato://');
                }
            },
            {
                text: 'Share on Pettato',
                onClick: function() {
                    share_with_freinds(share_image_link, title, share_feed_id, share_feed_type);
                }
            },
            {
                text: 'Cancel',
                onClick: function() {
                    myApp.closeModal();
                }
            },
        ]
    })
}

function share_with_freinds(share_image_link, title, share_feed_id, share_feed_type) {
    sharing_image = share_image_link;
    sharing_content = title;
    sharing_id = share_feed_id;
    sharing_type = share_feed_type;
    // myApp.alert("Shared with your friends!");
    mainView.router.load({
        url: 'share_with_freinds.html',
        ignoreCache: true,
    });
}

function feedSaveStatusChng() {
    var feed_id = $('.feedDetailsSave').data('feed_id');
    chngSaveStatus(feed_id);
}

function loadIssueFeedsDetails() {
    $(".feed_image").attr("src", image_url+'cover_pic.jpg');
    $(".inner_pro_pic").attr("src", image_url+'profile_dummy.jpg');
    $(".feed_creator").html('');
    $(".feed_comment_like").html('');
    $(".feed_desc").html('');
    $(".feed_comments_container").html('');

    $.ajax({
        url: base_url+'get_abuse_data',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            feed_id: feed_details_fetch_id,
            user_id: token.id,
        },
    }).done(function(res) {
        if (res.status == 'Success') {
            $(".feed_image").attr("src", image_url+res.response.image);
            $(".inner_pro_pic").attr("src", image_url+res.response.profile_image);

            if (res.response.user_type == 'Business') {
                $(".feed_creator").html('<span onclick="goto_business_page('+res.response.user_id+')">'+res.response.first_name+'</span>');
            } else {
                $(".feed_creator").html('<span onclick="goto_user_page('+res.response.user_id+')">'+res.response.first_name+'</span>');
            }

            $(".feed_comment_like").html(res.feed_comment_count+' Comments');
            $(".feed_desc").html(decodeURI(res.response.feeds_content));

            var comments = '';

            $.each(res.comments_response, function(index, value){
                comments += '<div class="message message-with-avatar message-received"> '+
                                '<div class="message-name" onclick="goto_user_page('+value.user_id+')">'+value.first_name+'</div>'+
                                '<div class="message-text-new">'+decodeURI(value.comment)+'</div>'+
                            '</div>';
            })

            $("#feedDetailsMessagesContainer").html(comments);

            $(".feedDetailsLike").attr('data-feed_id', res.response.feed_id);
            $(".feedDetailsShare").attr('data-feed_id', res.response.feed_id);
            $(".feedDetailsShare").attr('data-title', decodeURI(res.response.feeds_content).substring(0, 50));
            $(".feedDetailsShare").attr('data-image_link', image_url+res.response.image);
            $(".feedDetailsSave").attr('data-feed_id', res.response.feed_id);

            if (res.like_save_response.like_status == 1) {
                $(".feedDetailsLike").html('<i class="material-icons white_heart white_heart_active">favorite</i>');
            } else {
                $(".feedDetailsLike").html('<i class="material-icons white_heart white_heart_active">favorite_border</i>');
            }
        } else {
            myApp.alert('Please provide all the details!');
        }
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
    });
}

function loadFeedsDetails() {
    $(".feed_image").attr("src", image_url+'cover_pic.jpg');
    $(".inner_pro_pic").attr("src", image_url+'profile_dummy.jpg');
    $(".feed_creator").html('');
    $(".feed_comment_like").html('');
    $(".feed_desc").html('');
    $(".feed_comments_container").html('');

    $.ajax({
        url: base_url+'get_feed_data',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            feed_id: feed_details_fetch_id,
            user_id: token.id,
        },
    }).done(function(res) {
        if (res.status == 'Success') {
            $(".feed_image").attr("src", image_url+res.response.image);
            $(".inner_pro_pic").attr("src", image_url+res.response.profile_image);

            if (res.response.user_type == 'Business') {
                $(".feed_creator").html('<span onclick="goto_business_page('+res.response.user_id+')">'+res.response.first_name+'</span>');
            } else {
                $(".feed_creator").html('<span onclick="goto_user_page('+res.response.user_id+')">'+res.response.first_name+'</span>');
            }

            $(".feed_comment_like").html(res.feed_comment_count+' Comments '+res.likes_count+' Likes');
            $(".feed_desc").html(decodeURI(res.response.feeds_content));
            // $("#feedDetailsMessagesContainer").html('');

            var comments = '';

            $.each(res.comments_response, function(index, value){
                comments += '<div class="message message-with-avatar message-received"> '+
                                '<div class="message-name" onclick="goto_user_page('+value.user_id+')">'+value.first_name+'</div>'+
                                '<div class="message-text-new">'+decodeURI(value.comment)+'</div>'+
                            '</div>';
            })

            $("#feedDetailsMessagesContainer").html(comments);

            $(".feedDetailsLike").attr('data-feed_id', res.response.feed_id);
            $(".feedDetailsShare").attr('data-feed_id', res.response.feed_id);
            $(".feedDetailsShare").attr('data-title', decodeURI(res.response.feeds_content).substring(0, 50));
            $(".feedDetailsShare").attr('data-image_link', image_url+res.response.image);
            $(".feedDetailsSave").attr('data-feed_id', res.response.feed_id);

            if (res.like_save_response.like_status == 1) {
                $(".feedDetailsLike").html('<i class="material-icons white_heart white_heart_active">favorite</i>');
            } else {
                $(".feedDetailsLike").html('<i class="material-icons white_heart white_heart_active">favorite_border</i>');
            }
        } else {
            myApp.alert('Please provide all the details!');
        }
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
    });
}

function add_comment_issue_feed() {
    if (!$("#feed_comment").val()) {
        myApp.alert("Please enter the comment!");
        return false;
    }

    $.ajax({
        url: base_url+'add_comment_abuse',
        type: 'POST',
        crossDomain: true,
        data: {
            user_id: token.id,
            feed_id: $(".feedDetailsLike").data('feed_id'),
            comment: encodeURI($("#feed_comment").val()),
        }
    }).done(function(res){
        if (res.status == 'Success') {
            var comments = '<div class="message message-with-avatar message-received"> '+
                            '<div class="message-name">'+token.first_name+'</div>'+
                            '<div class="message-text-new">'+$("#feed_comment").val()+'</div>'+
                        '</div>';

            $("#feedDetailsMessagesContainer").prepend(comments);

            $("#feed_comment").val('');
        } else {
            myApp.alert("Unbale to upload comment, Please try again later!");
        }
    }).error(function(res){
        myApp.alert("Unbale to upload comment, Please try again later!");
    }).always(function(res){
    })
}

function add_comment_feed() {
    if (!$("#feed_comment").val()) {
        myApp.alert("Please enter the comment!");
        return false;
    }

    $.ajax({
        url: base_url+'add_comment_feed',
        type: 'POST',
        crossDomain: true,
        data: {
            user_id: token.id,
            feed_id: $(".feedDetailsLike").data('feed_id'),
            comment: encodeURI($("#feed_comment").val()),
        }
    }).done(function(res){
        if (res.status == 'Success') {
            var comments = '<div class="message message-with-avatar message-received"> '+
                            '<div class="message-name">'+token.first_name+'</div>'+
                            '<div class="message-text-new">'+$("#feed_comment").val()+'</div>'+
                        '</div>';

            $("#feedDetailsMessagesContainer").prepend(comments);

            $("#feed_comment").val('');
        } else {
            myApp.alert("Unbale to upload comment, Please try again later!");
        }
    }).error(function(res){
        myApp.alert("Unbale to upload comment, Please try again later!");
    }).always(function(res){
    })
}

function add_feed() {
    var feed_image = feed_image_upload.trim();
    var description = encodeURI($('#create_feed-description').val().trim());
    var location_id = '1';
    var post_create_id = 0;

    if (feed_image == '') {
        myApp.alert('Please upload image.');
        return false;
    }
    if (description == '') {
        myApp.alert('Please provide description.');
        return false;
    }
    if (!location_id) {
        myApp.alert('Please select location.');
        return false;
    }

    myApp.showIndicator();
    $.ajax({
        url: base_url+'get_users_business_acc',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: token.id,
        }
    }).done(function(res){
        var json_data = [];
        if (res.status == 'Success') {
            $.each(res.response, function(index, value){
                post_create_id = value.id;
                json_data.push({text: '@'+value.username, onClick: function() { create_feed(value.id, feed_image, description, location_id); }});
            })

            myApp.hideIndicator();

            myApp.modal({
                verticalButtons: true,
                buttons: json_data
            })
        } else {
            myApp.hideIndicator();
            myApp.alert("Unable to fetch user's list!");
        }
    }).error(function(res){
        myApp.hideIndicator();
        myApp.alert("Unable to fetch user's list!");
    })
}

function create_feed(post_create_id, feed_image, description, location_id) {
    myApp.showIndicator();
    $.ajax({
        url: base_url + 'create_feed',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: post_create_id,
            description: description,
            image: feed_image,
            location: location_id,
        },
    }).done(function(res) {
        myApp.hideIndicator();
        if (res.status == 'Success') {
            $(".CNGDynImg").attr('src', 'img/lazyload.jpg');
            mainView.router.load({
                url: 'feeds.html',
                ignoreCache: true,
            });

        } else {
            myApp.alert('Please provide all the details!');
        }
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
    });
}

function goto_profile() {
    account_default_id = token.id;
    if (token.user_type == 'User') {
        mainView.router.load({
            url: 'profile_shopper.html',
            query: {
                id: token
            },
            ignoreCache: true,
        });
    } else {
        mainView.router.load({
            url: 'profile_business.html',
            query: {
                id: token
            },
            ignoreCache: true,
        });
    }
}

function loadUsersSubPageContent(user_id) {
    myApp.showIndicator();
    $(".user_sub_cover_image").attr("src", image_url+'cover_pic.jpg');
    $(".user_sub_profie_image").attr("src", image_url+'profile_dummy.jpg');
    $(".p_name_business_sub").html('');
    $(".p_name1_business_sub").html('');
    $(".user_sub_followers").text('0');
    $(".user_sub_followings").text('0');
    $(".unfollow, .follow, .chat").hide();

    $.ajax({
        url: base_url + 'get_user_profile',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: user_id, token_profile_id: token.id,
        },
    }).done(function(res) {
        // console.log(res.status);
        if (res.status == 'Success') {
            $('.cover_image_btn').show();

            $(".user_sub_cover_image").attr("src", image_url+res.response.user_details.cover_pic);
            $(".user_sub_profie_image").attr("src", image_url+res.response.user_details.profile_image);
            $('.user_sub_followers').text(res.followers);
            $('.user_sub_followings').text(res.followings);
            $('.p_name').html(res.response.user_details.first_name);
            $('.p_name').attr('data-business_id', res.response.user_details.id);
            $('.userssubfollowersfollowingaccid').attr('data-userssubfollowersfollowingaccid', res.response.user_details.id);
            $('.make_unfollow, .make_follow, .make_chat').attr('data-userid', res.response.user_details.id);

            $("#pets_and_business_profiles_list").html('');
            var profiles_list = '';

            // console.log('Profile Data Loaded');

            $.each(res.response.pet_list, function(index, value){
                if (value.user_type == 'Pet') {
                    profiles_list += '<div class="change_width-20 text-center" onclick="goto_profile_shopper_pet('+value.id+')">'+
                                        '<img src="'+image_url+value.profile_image+'" width="70%" style="border-radius: 5px">'+
                                        '<p class="mrg0 color_757575">'+value.first_name+'</p>'+
                                    '</div>';
                } else {
                    profiles_list += '<div class="change_width-20 text-center" onclick="goto_business_page('+value.id+')">'+
                                        '<img src="'+image_url+value.profile_image+'" width="70%" style="border-radius: 5px">'+
                                        '<p class="mrg0 color_757575">'+value.username+'</p>'+
                                    '</div>';
                }
            })

            if (res.response.user_details.id == token.id) {
                profiles_list += '<div class="change_width-20 text-center" onclick="goto_before_add_account();">'+
                                    '<img src="img/create-group-button.png" width="60%" style="border-radius: 5px; padding: 5%;">'+
                                    '<p class="mrg0 color_757575">Add Profile</p>'+
                                '</div>';
            }


            $("#pets_and_business_profiles_list").html(profiles_list);

            // console.log('Profiles loaded');

            var feeds_html = '';
            var save_feeds_html = '';

            $(".profile-feed-container, .profile-save-feed-container").html('Loading Feeds...');

            $.each(res.response.feeds, function(index, value){
                var title = value.description;
                var share_image_link = image_url+value.image;
                var share_link = 'http://pettato.com';

                feeds_html += '<div class="card c_ard ks-facebook-card own_feed">'+
                                '<div class="black_overlay"></div>'+
                                '<a class="card-content" onclick="load_feed_page('+value.id+')">'+
                                '<img data-src="'+image_url+value.image+'" src="'+image_url+value.image+'" width="100%" class="lazy lazy-fadein">'+
                                '</a>'+
                                '<div class="card-footer no-border like_share pad0" style="width: 40%;">'+
                                '<a href="javascript:void(0);" data-liked="0" class=""><i onclick="feedShareStatusChng('+value.id+')" data-title="'+title+'" data-image_link="'+share_image_link+'" class="material-icons white_heart share_feeds_'+value.id+'">share</i></a>';
                                if (value.user_id == token.id) {
                                    feeds_html += '<a href="javascript:void(0);" data-liked="0" onclick="delete_feed('+value.id+')" class=""><i class="material-icons white_heart">delete</i></a>';
                                }
                feeds_html +='</div>'+
                        '</div>';
            })

            feeds_html += '<span style="min-height: 40px; width: 100%;" class="card c_ard ks-facebook-card own_feed"></span>';

            $.each(res.response.saved_feeds, function(index, value){
                var title = value.feed_desc;
                var share_image_link = image_url+value.feed_image;
                var share_link = 'http://pettato.com';

                if (value.feed_type == 'Feed') {
                    save_feeds_html += '<div class="card c_ard ks-facebook-card own_feed">'+
                                    '<div class="black_overlay"></div>'+
                                    '<a class="card-content" onclick="load_feed_page('+value.feed_id+')">'+
                                    '<img data-src="'+image_url+value.feed_image+'" src="'+image_url+value.feed_image+'" width="100%" class="lazy lazy-fadein">'+
                                    '</a>'+
                                    '<div class="card-footer no-border like_share pad0" style="width: 40%;">'+
                                    '<a href="javascript:void(0);" data-liked="0" class=""><i onclick="feedShareStatusChng('+value.feed_id+')" data-title="'+title+'" data-image_link="'+share_image_link+'" class="material-icons white_heart share_feeds_'+value.feed_id+'">share</i></a>';
                                    if (value.user_id == token.id) {
                                        save_feeds_html += '<a href="javascript:void(0);" data-liked="0" onclick="delete_saved('+value.rel_id+')" class=""><i class="material-icons white_heart">delete</i></a>';
                                    }
                    save_feeds_html += '</div>'+
                                    '</div>';
                }

                if (value.feed_type == 'Become Parent') {
                    save_feeds_html += '<div class="card c_ard ks-facebook-card own_feed">'+
                                    '<div class="black_overlay"></div>'+
                                    '<a class="card-content" onclick="goto_becomeParentDetails('+value.feed_id+')">'+
                                    '<img data-src="'+image_url+value.feed_image+'" src="'+image_url+value.feed_image+'" width="100%" class="lazy lazy-fadein">'+
                                    '</a>'+
                                    '<div class="card-footer no-border like_share pad0" style="width: 40%;">'+
                                    '<a href="javascript:void(0);" data-liked="0" class=""><i onclick="feedShareStatusChng('+value.feed_id+')" data-title="'+title+'" data-image_link="'+share_image_link+'" class="material-icons white_heart share_feeds_'+value.feed_id+'">share</i></a>';
                                    if (value.user_id == token.id) {
                                        save_feeds_html += '<a href="javascript:void(0);" data-liked="0" onclick="delete_saved('+value.rel_id+')" class=""><i class="material-icons white_heart">delete</i></a>';
                                    }
                    save_feeds_html += '</div>'+
                                    '</div>';
                }

            })

            save_feeds_html += '<span style="min-height: 40px; width: 100%;" class="card c_ard ks-facebook-card own_feed"></span>';

            if (feeds_html) {
                feeds_html += '<br><br>';
                $(".profile-feed-container").html(feeds_html);
            } else {
                $(".profile-feed-container").html('There are no feeds created by this account!');
            }

            if (save_feeds_html) {
                save_feeds_html += '<br><br>';
                $(".profile-save-feed-container").html(save_feeds_html);
            } else {
                $(".profile-save-feed-container").html('There are no feeds created by this account!');
            }

            // console.log('Bottom Html Loaded');

            if (token.id !== res.response.user_details.id) {
                if (res.response.follower_status == 'Unfollow') {
                    $(".follow").show();
                } else {
                    $(".unfollow").show();
                }

                $(".chat").show();
            }

            myApp.hideIndicator();
        } else {
            myApp.hideIndicator();
            myApp.alert("Unable to load data, Please try again later!");
        }
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function() {
    });
}

function loadUsersPageContent(user_id) {
    myApp.showIndicator();
    $(".cover_image").attr("src", image_url+'cover_pic.jpg');
    $(".profie_image").attr("src", image_url+'profile_dummy.jpg');
    $(".p_name_business_sub").html('');
    $(".p_name1_business_sub").html('');
    $(".user_follwers").text('0');
    $(".user_followings").text('0');
    $(".unfollow, .follow, .chat").hide();

    $.ajax({
        url: base_url + 'get_user_profile',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: user_id, token_profile_id: token.id,
        },
    }).done(function(res) {
        if (res.status == 'Success') {
            $('.cover_image_btn').show();

            $(".cover_image").attr("src", image_url+res.response.user_details.cover_pic);
            $(".profie_image").attr("src", image_url+res.response.user_details.profile_image);
            $('.user_follwers').text(res.followers);
            $('.user_followings').text(res.followings);
            $('.p_name').html(res.response.user_details.first_name);
            $('.p_name').attr('data-business_id', res.response.user_details.id);
            $('.usersfollowersfollowingaccid').attr('data-usersfollowersfollowingaccid', res.response.user_details.id);
            $('.make_unfollow, .make_follow, .make_chat').attr('data-userid', res.response.user_details.id);

            $("#pets_and_business_profiles_list").html('');
            var profiles_list = '';

            $.each(res.response.pet_list, function(index, value){
                if (value.user_type == 'Pet') {
                    profiles_list += '<div class="change_width-20 text-center" onclick="goto_profile_shopper_pet('+value.id+')">'+
                                        '<img src="'+image_url+value.profile_image+'" width="70%" style="border-radius: 5px">'+
                                        '<p class="mrg0 color_757575">'+value.first_name+'</p>'+
                                    '</div>';
                } else {
                    profiles_list += '<div class="change_width-20 text-center" onclick="goto_business_page('+value.id+')">'+
                                        '<img src="'+image_url+value.profile_image+'" width="70%" style="border-radius: 5px">'+
                                        '<p class="mrg0 color_757575">'+value.username+'</p>'+
                                    '</div>';
                }
            })

            if (res.response.user_details.id == token.id) {
                profiles_list += '<div class="change_width-20 text-center" onclick="goto_before_add_account();">'+
                                    '<img src="img/create-group-button.png" width="60%" style="border-radius: 5px; padding: 5%;">'+
                                    '<p class="mrg0 color_757575">Add Profile</p>'+
                                '</div>';
            }


            $("#pets_and_business_profiles_list").html(profiles_list);

            var feeds_html = '';
            var save_feeds_html = '';

            $(".profile-feed-container, .profile-save-feed-container").html('Loading Feeds...');

            $.each(res.response.feeds, function(index, value){
                var title = value.description;
                var share_image_link = image_url+value.image;
                var share_link = 'http://pettato.com';

                feeds_html += '<div class="card c_ard ks-facebook-card own_feed">'+
                                '<div class="black_overlay"></div>'+
                                '<a class="card-content" onclick="load_feed_page('+value.id+')">'+
                                '<img data-src="'+image_url+value.image+'" src="'+image_url+value.image+'" width="100%" class="lazy lazy-fadein">'+
                                '</a>'+
                                '<div class="card-footer no-border like_share pad0" style="width: 40%;">'+
                                '<a href="javascript:void(0);" data-liked="0" class=""><i onclick="feedShareStatusChng('+value.id+')" data-title="'+title+'" data-image_link="'+share_image_link+'" class="material-icons white_heart share_feeds_'+value.id+'">share</i></a>';
                                if (value.user_id == token.id) {
                                    feeds_html += '<a href="javascript:void(0);" data-liked="0" onclick="delete_feed('+value.id+')" class=""><i class="material-icons white_heart">delete</i></a>';
                                }
                feeds_html +='</div>'+
                        '</div>';
            })

            feeds_html += '<span style="min-height: 40px; width: 100%;" class="card c_ard ks-facebook-card own_feed"></span>';

            $.each(res.response.saved_feeds, function(index, value){
                var title = value.feed_desc;
                var share_image_link = image_url+value.feed_image;
                var share_link = 'http://pettato.com';

                if (value.feed_type == 'Feed') {
                    save_feeds_html += '<div class="card c_ard ks-facebook-card own_feed">'+
                                    '<div class="black_overlay"></div>'+
                                    '<a class="card-content" onclick="load_feed_page('+value.feed_id+')">'+
                                    '<img data-src="'+image_url+value.feed_image+'" src="'+image_url+value.feed_image+'" width="100%" class="lazy lazy-fadein">'+
                                    '</a>'+
                                    '<div class="card-footer no-border like_share pad0" style="width: 40%;">'+
                                    '<a href="javascript:void(0);" data-liked="0" class=""><i onclick="feedShareStatusChng('+value.feed_id+')" data-title="'+title+'" data-image_link="'+share_image_link+'" class="material-icons white_heart share_feeds_'+value.feed_id+'">share</i></a>';
                                    if (value.user_id == token.id) {
                                        save_feeds_html += '<a href="javascript:void(0);" data-liked="0" onclick="delete_saved('+value.rel_id+')" class=""><i class="material-icons white_heart">delete</i></a>';
                                    }
                    save_feeds_html += '</div>'+
                                    '</div>';
                }

                if (value.feed_type == 'Become Parent') {
                    save_feeds_html += '<div class="card c_ard ks-facebook-card own_feed">'+
                                    '<div class="black_overlay"></div>'+
                                    '<a class="card-content" onclick="goto_becomeParentDetails('+value.feed_id+')">'+
                                    '<img data-src="'+image_url+value.feed_image+'" src="'+image_url+value.feed_image+'" width="100%" class="lazy lazy-fadein">'+
                                    '</a>'+
                                    '<div class="card-footer no-border like_share pad0" style="width: 40%;">'+
                                    '<a href="javascript:void(0);" data-liked="0" class=""><i onclick="feedShareStatusChng('+value.feed_id+')" data-title="'+title+'" data-image_link="'+share_image_link+'" class="material-icons white_heart share_feeds_'+value.feed_id+'">share</i></a>';
                                    if (value.user_id == token.id) {
                                        save_feeds_html += '<a href="javascript:void(0);" data-liked="0" onclick="delete_saved('+value.rel_id+')" class=""><i class="material-icons white_heart">delete</i></a>';
                                    }
                    save_feeds_html += '</div>'+
                                    '</div>';
                }

                // if (value.feed_type == 'Find Parent') {
                //     save_feeds_html += '<div class="card facebook-card own_feed">'+
                //                             '<div class="card-content">'+
                //                                 '<div class="card-content-inner">'+
                //                                     '<p>'+value.feed_desc+'</p>'+
                //                                 '</div>'+
                //                             '</div>'+
                //                         '</div>';
                // }

            })

            save_feeds_html += '<span style="min-height: 40px; width: 100%;" class="card c_ard ks-facebook-card own_feed"></span>';

            if (feeds_html) {
                feeds_html += '<br><br>';
                $(".profile-feed-container").html(feeds_html);
            } else {
                $(".profile-feed-container").html('There are no feeds created by this account!');
            }

            if (save_feeds_html) {
                save_feeds_html += '<br><br>';
                $(".profile-save-feed-container").html(save_feeds_html);
            } else {
                $(".profile-save-feed-container").html('There are no feeds created by this account!');
            }

            if (token.id !== res.response.user_details.id) {
                if (res.response.follower_status == 'Unfollow') {
                    $(".follow").show();
                } else {
                    $(".unfollow").show();
                }

                $(".chat").show();
            }
        }
        myApp.hideIndicator();
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function() {
    });
}

function make_unfollow(type) {
    var fieldtoget = '.'+type+'_make_follow';
    myApp.showIndicator();
    $.ajax({
        url: base_url+'make_unfollow',
        type: 'POST',
        crossDomain: true,
        data: {
            user_id: $(fieldtoget).data('userid'), user_token_id: token.id,
        }
    }).done(function(res){
        myApp.hideIndicator();
        if (res.status == 'Success') {
            $(".unfollow").hide();
            $(".follow").show();
        } else {
            myApp.alert(res.api_msg);
        }
    }).error(function(res){
        myApp.hideIndicator();
        myApp.alert('Unbale to update, Please try again later!');
    }).always(function(res){
        myApp.hideIndicator();
    })
}

function make_follow(type) {
    var fieldtoget = '.'+type+'_make_follow';
    myApp.showIndicator();
    $.ajax({
        url: base_url+'make_follow',
        type: 'POST',
        crossDomain: true,
        data: {
            user_id: $(fieldtoget).data('userid'), user_token_id: token.id,
        }
    }).done(function(res){
        myApp.hideIndicator();
        if (res.status == 'Success') {
            $(".follow").hide();
            $(".unfollow").show();
        } else {
            myApp.alert(res.api_msg);
        }
    }).error(function(res){
        myApp.hideIndicator();
        myApp.alert('Unbale to update, Please try again later!');
    }).always(function(res){
        myApp.hideIndicator();
    })
}

function make_chat(type) {
    var user_id = 0;

    if (type == 'business_sub') {
        user_id = $(".business_sub_make_chat").data('userid');
    } else if (type == 'business') {
        user_id = $(".business_make_chat").data('userid');
    } else {
        user_id = $(".user_sub_make_chat").data('userid');
    }
    goto_chat_inner(user_id);
}

function add_review_business() {
    var html_count = $(".addBusinessReview_active").length;

    if (!html_count || html_count == 0) {
        myApp.alert("Please add Review");
        return false;
    }

    if (!$("#review_comments").val()) {
        myApp.alert("Please add comments!");
        return false;
    }

    myApp.showIndicator();
    $.ajax({
        url: base_url+'add_review_business',
        type: 'POST',
        crossDomain: true,
        data: {
            business_id: $(".p_name_business_sub").data('business_id'),
            user_id: token.id,
            comment: encodeURI($("#review_comments").val()),
            review: html_count
        }
    }).done(function(res) {
        myApp.hideIndicator();
        if (res.status == 'Success') {
            myApp.alert('Thank you for reviewing the Business!');
            $(".addBusinessReview").removeClass('addBusinessReview_active');
            $("#review_comments").val('');
            $(".close-popup").click();
        } else {
            myApp.alert(res.api_msg);
            return false;
        }
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function() {
    });
}

function loadBusinessPageContent(user_id) {
    myApp.showIndicator();
    $(".business_cover_image").attr("src", image_url+'cover_pic.jpg');
    $(".business_profie_image").attr("src", image_url+'profile_dummy.jpg');
    $(".p_name_business_sub").html('');
    $(".p_name1_business_sub").html('');
    $(".business_followers").text('0');
    $(".business_followings").text('0');
    $(".unfollow, .follow, .chat").hide();

    $.ajax({
        url: base_url + 'get_user_profile',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: user_id, token_profile_id: token.id,
        },
    }).done(function(res) {
        if (res.status == 'Success') {
            if (res.response.user_details.linked_acc_id !== token.id) {
                $(".edit_profileButtonhide").hide();
            }

            $(".business_cover_image").attr("src", image_url+res.response.user_details.cover_pic);
            $(".business_profie_image").attr("src", image_url+res.response.user_details.profile_image);

            $('.cover_image_btn').show();

            $('.business_followers').text(res.followers);
            // $('.business_followings').text(res.followings);

            $('.businessfollowersfollowingaccid').attr('data-businessfollowersfollowingaccid', res.response.user_details.id);

            var stars_html = '';
            var stars_count = Math.round(res.response.stars_count);

            for (var i = 0; i < stars_count; i++) {
                stars_html += '<i class="material-icons">star_rate</i>';
            }

            var append_p_name = res.response.user_details.company+'<br>'+res.response.user_details.username+'<br>'+stars_html+'<br><p class="color_757575 mrg0" style="font-size: 13px">'+res.response.reviews_count+' Reviews &nbsp;&nbsp;&nbsp;<a href="#" data-popup=".popup-review" class="open-popup color_757575 mrg0" style="font-size: 13px">Add Review</a></p>';

            $('.p_name_business_sub').html(append_p_name);
            $('.p_name_business_sub').attr('data-business_id', res.response.user_details.id);

            var category_list = '';

            $.each(res.response.business_category, function(index, value){
                if(index == 0) {
                    category_list += value.category_name;
                } else {
                    category_list += ', '+value.category_name;
                }
            })

            $(".p_categories").html(category_list);

            $('.make_unfollow, .make_follow').attr('data-userid', res.response.user_details.id);
            $('.business_sub_make_chat').attr('data-userid', res.response.user_details.id);

            $(".business_make_call").attr('data-businessnumber', res.response.user_details.phone);
            $(".business_email_to_text").attr('data-businessemail', res.response.user_details.email);
            $(".business_email_to_text").html('Email');
            $(".business_location_to").attr('data-businesslat', res.response.user_details.lat);
            $(".business_location_to").attr('data-businesslong', res.response.user_details.lng);
            $(".business_location_to").attr('data-address', res.response.user_details.address);
            $(".business_location_to").attr('data-company', res.response.user_details.company);

            $(".business_location_to").click(function(e){
                e.preventDefault();
                myApp.alert($(this).data('address'), $(this).data('company'));
            })

            $(".business_email_to_text").click(function(e){
                e.preventDefault();
                myApp.alert($(this).data('businessemail'), 'You can contact on:');
            })

            $(".business_make_call").click(function(e){
                e.preventDefault();
                make_call($(this).data('businessnumber'));
            })

            var feeds_html = '';
            var reviews_html = '';

            $(".profile-feed-container").html('Loading Feeds...');
            $(".profile-reviews_container").html('Loading Reviews...');

            $.each(res.response.feeds, function(index, value) {
                var title = value.description;
                var share_image_link = image_url+value.image;
                var share_link = 'http://pettato.com';

                feeds_html += '<div class="card c_ard ks-facebook-card own_feed">'+
                                '<div class="black_overlay"></div>'+
                                '<a class="card-content" onclick="load_feed_page('+value.id+')">'+
                                '<img data-src="'+image_url+value.image+'" src="'+image_url+value.image+'" width="100%" class="lazy lazy-fadein">'+
                                '</a>'+
                                '<div class="card-footer no-border like_share pad0" style="width: 40%;">'+
                                '<a href="javascript:void(0);" data-liked="0" onclick="window.plugins.socialsharing.share("'+title+'", "'+title+'", "'+share_image_link+'", "'+share_link+'")" class=""><i class="material-icons white_heart">share</i></a>';
                                if (value.user_id == token.id || res.response.user_details.linked_acc_id == token.id) {
                                    feeds_html += '<a href="javascript:void(0);" data-liked="0" onclick="delete_feed('+value.id+')" class=""><i class="material-icons white_heart">delete</i></a>';
                                }
                feeds_html += '</div>'+
                                '</div>';
            })

            console.log(feeds_html);

            if (feeds_html) {
                $(".profile-feed-container").html(feeds_html);
            } else {
                $(".profile-feed-container").html('There are no feeds created by this account!');
            }

            $.each(res.response.business_reviews, function(index, value){
                reviews_html += '<div class="card">'+
                                    '<div class="card-header">'+value.first_name+'</div>'+
                                    '<div class="card-content">'+
                                        '<div class="card-content-inner text-left">'+decodeURI(value.comments)+'</div>'+
                                    '</div>'+
                                    '<div class="card-footer">'+
                                    '<p class="reviews_star">';

                for (var i = 0; i < value.rating; i++) {
                    reviews_html += '<i class="material-icons">star_rate</i>';
                }

                reviews_html += '</p>'+
                                '</div>'+
                                '</div>';
            })

            if (reviews_html) {
                $(".profile-reviews_container").html(reviews_html);
            } else {
                $(".profile-reviews_container").html('There are no reviews created by this account!');
            }

            if (token.id !== res.response.user_details.id) {
                if (res.response.follower_status == 'Unfollow') {
                    $(".follow").show();
                } else {
                    $(".unfollow").show();
                }

                $(".chat").show();
            }
        }

        myApp.hideIndicator();
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function() {
    });
}

function loadBusinessPageContentSub(user_id) {
    myApp.showIndicator();
    $(".business_cover_image").attr("src", image_url+'cover_pic.jpg');
    $(".business_profie_image").attr("src", image_url+'profile_dummy.jpg');
    $(".p_name_business_sub").html('');
    $(".p_name1_business_sub").html('');
    $(".business_sub_followers").text('0');
    $(".business_sub_followings").text('0');
    $(".unfollow, .follow, .chat").hide();

    $.ajax({
        url: base_url + 'get_user_profile',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: user_id, token_profile_id: token.id,
        },
    }).done(function(res) {
        if (res.status == 'Success') {
            if (res.response.user_details.linked_acc_id !== token.id) {
                $(".edit_profileButtonhide").hide();
            }

            $(".business_cover_image").attr("src", image_url+res.response.user_details.cover_pic);
            $(".business_profie_image").attr("src", image_url+res.response.user_details.profile_image);

            $('.cover_image_btn').show();

            $('.business_sub_followers').text(res.followers);
            // $('.business_sub_followings').text(res.followings);

            $('.businessfollowersfollowingaccid').attr('data-businessfollowersfollowingaccid', res.response.user_details.id);

            var stars_html = '';
            var stars_count = Math.round(res.response.stars_count);

            for (var i = 0; i < stars_count; i++) {
                stars_html += '<i class="material-icons">star_rate</i>';
            }

            var append_p_name = res.response.user_details.company+'<br>'+res.response.user_details.username+'<br>'+stars_html+'<br><p class="color_757575 mrg0" style="font-size: 13px">'+res.response.reviews_count+' Reviews &nbsp;&nbsp;&nbsp;<a href="#" data-popup=".popup-review" class="open-popup color_757575 mrg0" style="font-size: 13px">Add Review</a></p>';

            $('.p_name_business_sub').html(append_p_name);
            $('.p_name_business_sub').attr('data-business_id', res.response.user_details.id);
            $('.business_sub_make_unfollow, .business_sub_make_follow').attr('data-userid', res.response.user_details.id);
            $('.business_sub_make_chat').attr('data-userid', res.response.user_details.id);

            var category_list = '';

            $.each(res.response.business_category, function(index, value){
                if(index == 0) {
                    category_list += value.category_name;
                } else {
                    category_list += ', '+value.category_name;
                }
            })

            $(".p_categories").html(category_list);

            $(".business_make_call").attr('data-businessnumber', res.response.user_details.phone);
            $(".business_email_to_text").attr('data-businessemail', res.response.user_details.email);
            $(".business_email_to_text").html('Email');
            $(".business_location_to").attr('data-businesslat', res.response.user_details.lat);
            $(".business_location_to").attr('data-businesslong', res.response.user_details.lng);
            $(".business_location_to").attr('data-address', res.response.user_details.address);
            $(".business_location_to").attr('data-company', res.response.user_details.company);

            $(".business_location_to").click(function(e){
                e.preventDefault();
                myApp.alert($(this).data('address'), $(this).data('company'));
            })

            $(".business_email_to_text").click(function(e){
                e.preventDefault();
                myApp.alert($(this).data('businessemail'), 'You can contact on:');
            })

            $(".business_make_call").click(function(e){
                e.preventDefault();
                make_call($(this).data('businessnumber'));
            })

            var feeds_html = '';
            var reviews_html = '';

            $(".profile-feed-container").html('Loading Feeds...');
            $(".profile-reviews_container").html('Loading Reviews...');

            $.each(res.response.feeds, function(index, value) {
                var title = value.description;
                var share_image_link = image_url+value.image;
                var share_link = 'http://pettato.com';

                feeds_html += '<div class="card c_ard ks-facebook-card own_feed">'+
                                '<div class="black_overlay"></div>'+
                                '<a class="card-content" onclick="load_feed_page('+value.id+')">'+
                                '<img data-src="'+image_url+value.image+'" src="'+image_url+value.image+'" width="100%" class="lazy lazy-fadein">'+
                                '</a>'+
                                '<div class="card-footer no-border like_share pad0" style="width: 40%;">'+
                                '<a href="javascript:void(0);" data-liked="0" onclick="window.plugins.socialsharing.share("'+title+'", "'+title+'", "'+share_image_link+'", "'+share_link+'")" class=""><i class="material-icons white_heart">share</i></a>';
                                if (value.user_id == token.id || res.response.user_details.linked_acc_id == token.id) {
                                    feeds_html += '<a href="javascript:void(0);" data-liked="0" onclick="delete_feed('+value.id+')" class=""><i class="material-icons white_heart">delete</i></a>';
                                }
                feeds_html += '</div>'+
                                '</div>';

            })

            if (feeds_html) {
                $(".profile-feed-container").html(feeds_html);
            } else {
                $(".profile-feed-container").html('There are no feeds created by this account!');
            }

            $.each(res.response.business_reviews, function(index, value){
                reviews_html += '<div class="card">'+
                                    '<div class="card-header">'+value.first_name+'</div>'+
                                    '<div class="card-content">'+
                                        '<div class="card-content-inner text-left">'+decodeURI(value.comments)+'</div>'+
                                    '</div>'+
                                    '<div class="card-footer">'+
                                    '<p class="reviews_star">';

                for (var i = 0; i < value.rating; i++) {
                    reviews_html += '<i class="material-icons">star_rate</i>';
                }

                reviews_html += '</p>'+
                                '</div>'+
                                '</div>';
            })

            if (reviews_html) {
                $(".profile-reviews_container").html(reviews_html);
            } else {
                $(".profile-reviews_container").html('There are no reviews created by this account!');
            }

            if (token.id !== res.response.user_details.id) {
                if (res.response.follower_status == 'Unfollow') {
                    $(".follow").show();
                } else {
                    $(".unfollow").show();
                }

                $(".chat").show();
            }
        }

        myApp.hideIndicator();
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function() {
    });
}

function goto_profile_shopper_pet(pet_id) {
    pet_static_account_id = pet_id;
    mainView.router.load({
        url: 'profile_shopper_pet.html',
        ignoreCache: true,
    });
}

function goto_business_page(business_id) {
    mainView.router.load({
        url: 'profile_business_sub.html',
        ignoreCache: true,
        query: {
            id: business_id
        },
    });
}

function loadPetPageContent(pet_id) {
    $(".pet_cover_image").attr("src", image_url+'cover_pic.jpg');
    $(".pet_profie_image").attr("src", image_url+'profile_dummy.jpg');

    myApp.showIndicator();
    $.ajax({
        url: base_url + 'get_pet_profile_data',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: pet_id,
        },
    }).done(function(res) {
        $(".pet_details_profile_tb_row").html('Loading Details...');

        if (res.response.linked_acc_id !== token.id) {
            $(".edit_profileButtonhide").hide();
            $(".hideforOthers").hide();
        }

        $(".share_profileButtonhide").attr('data-title', res.response.first_name);
        $(".share_profileButtonhide").attr('data-image_link', image_url+res.response.profile_image);

        // owners_name

        $(".pet_cover_image").attr("src", image_url+res.response.cover_pic);
        $(".pet_profie_image").attr("src", image_url+res.response.profile_image);

        var html = '<div class="row">'+
                    '<div class="col-33">Name</div>'+
                    '<div class="col-66">'+res.response.first_name+'</div>'+
                    '</div>'+
                    // '<div class="row">'+
                    // '<div class="col-33">Username</div>'+
                    // '<div class="col-66">'+res.response.username+'</div>'+
                    // '</div>'+
                    '<div class="row">'+
                    '<div class="col-33">Owner</div>'+
                    '<div class="col-66" onclick="goto_user_page('+res.response.owners_id+');">'+res.response.owners_name+' (@'+res.response.owners_username+')</div>'+
                    '</div>'+
                    '<div class="row">'+
                    '<div class="col-33">Type of Pet</div>'+
                    '<div class="col-66">'+res.response.pet_type+'</div>'+
                    '</div>'+
                    '<div class="row">'+
                    '<div class="col-33">Breed Name</div>'+
                    '<div class="col-66">'+res.response.pet_breed+'</div>'+
                    '</div>'+
                    '<div class="row">'+
                    '<div class="col-33">Age</div>'+
                    '<div class="col-66">'+res.response.age+'</div>'+
                    '</div>'+
                    '<div class="row">'+
                    '<div class="col-33">Gender</div>'+
                    '<div class="col-66">'+res.response.gender+'</div>'+
                    '</div>'+
                    '<div class="row">'+
                    '<div class="col-33">Location</div>'+
                    '<div class="col-66">'+res.response.pet_city+'</div>'+
                    '</div>';
        $(".pet_details_profile_tb_row").html(html);
        myApp.hideIndicator();
    }).error(function(res) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(res) {
    })
}

function add_to_become_parent() {
    var pettype = $("#become_parent_create-pettype").val();
    var age = $("#become_parent_create-age").val();
    var description = $("#become_parent_create-description").val();

    if (!pettype) {
        myApp.alert("Enter all the details!");
        return false;
    }
    if (!pettype == 'Select Pet Type') {
        myApp.alert("Enter all the details!");
        return false;
    }
    if (!age) {
        myApp.alert("Enter all the details!");
        return false;
    }
    if (!description) {
        myApp.alert("Enter all the details!");
        return false;
    }

    myApp.showIndicator();

    $.ajax({
        url: base_url+'add_become_parent',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            pettype: pettype,
            age: age,
            description: encodeURI(description),
            user_id: token.id
        }
    }).done(function(res){
        if (res.status == 'Success') {
            mainView.router.load({
                url: 'find_parent_list.html',
                ignoreCache: true,
            });
        } else {
            myApp.alert('Please provide all the details!');
        }
    }).error(function(err) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
    });

}

function add_to_find_parent() {
    var name = $("#find_parent_create-name").val();
    var pettype = $("#find_parent_create-pettype").val();
    var breed = $("#find_parent_create-breed").val();
    var age = $("#find_parent_create-age").val();
    var description = $("#find_parent_create-description").val();
    var gender = '';

    if ($("#find_parent_create-Male").is(":checked")) {
        gender = 'Male';
    }

    if ($("#find_parent_create-Female").is(":checked")) {
        gender = 'Female';
    }

    var profile_btn = profile_cover_image_link;
    var cover_btn = profile_cover_image_link;

    if (!name) {
        myApp.alert('Please provide pet name.');
        return false;
    }

    if (!pettype || pettype == "Select Pet Type") {
        myApp.alert('Please provide Pet Type.');
        return false;
    }

    if (!breed || breed == "Select Pet Type") {
        myApp.alert('Please provide Breed.');
        return false;
    }

    if (!age) {
        myApp.alert('Please provide age.');
        return false;
    }

    if (!description) {
        myApp.alert('Please provide description.');
        return false;
    }

    if (!gender) {
        myApp.alert('Please provide gender.');
        return false;
    }

    if (!profile_btn) {
        myApp.alert('Please provide Profile Picture.');
        return false;
    }

    if (!cover_btn) {
        myApp.alert('Please provide Cover Picture.');
        return false;
    }

    myApp.showIndicator();

    $.ajax({
        url: base_url + 'add_find_parent',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            name: name,
            pettype: pettype,
            breed: breed,
            age: age,
            description: encodeURI(description),
            gender: gender,
            profile_btn: profile_btn,
            cover_btn: cover_btn,
            user_id: token.id,
        },
    }).done(function(res) {
        myApp.hideIndicator();
        if (res.status == 'Success') {
            mainView.router.load({
                url: 'become_parent_list.html',
                ignoreCache: true,
            });
        } else {
            myApp.alert('Please provide all the details!');
        }
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
    });

}

function loadBecomeParentFilteredContent(user_id) {
    myApp.showIndicator();

    $.ajax({
        url: base_url+'get_become_parent_list_filtered',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: user_id, 
            pettype: find_parent_filter_pettype,
            breed: find_parent_filter_breed,
            age: find_parent_filter_age,
            gender: find_parent_filter_gender,
        }
    }).done(function(res){
        if (res.status == 'Success') {
            var html = '';
            $.each(res.response, function(index, value){
                html += '<div class="item">'+
                        '<a class="card-content color_8ac640" onclick="goto_becomeParentDetails('+value.id+');">'+
                        '<div class="profile_photo">'+
                        '<img src="'+image_url+value.profile_pic+'" width="100%">'+
                        '</div>'+
                        '<div class="content_blocker">'+
                        '<h3 class="mrg0">'+value.pet_name+'</h3>'+
                        '<p class="mrg0">'+value.pet_type+'</p>'+
                        '<p class="mrg0">Age: '+value.age+'</p>'+
                        '<p class="mrg0">'+value.gender+'</p>'+
                        '</div>'+
                        '</a>'+
                        '</div>';
            })

            $("#become_parent_listDyn").html(html);

            myApp.hideIndicator();
        } else {
            myApp.hideIndicator();
            var html = '<p style="text-align: center;">'+res.api_msg+'</p>';
            $("#become_parent_listDyn").html(html);
        }
    }).error(function(res){
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
    });
}

function deleteFindParent(feed_id) {
    myApp.prompt('This will erase the details from your profile, Do you realy want to delete?', function (value) {
        $.ajax({
            url: base_url+'remove_find_parent_id',
            type: 'POST',
            dataType: 'json',
            crossDomain: true,
            data: {
                feed_id: feed_id,
                user_id: token.id
            }
        }).done(function(res){
            if (res.status == 'Success') {
                myApp.alert(res.api_msg);
                goto_profile();
            } else {
                myApp.alert(res.api_msg);
            }
        }).error(function(err) {
            myApp.hideIndicator();
            myApp.alert('Somthing went wrong, Please try again later!');
        }).always(function(){
        });
    })
}

function loadBecomeParentMyList(user_id) {
    $.ajax({
        url: base_url+'get_find_parent_my_list',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: user_id,
        }
    }).done(function(res){
        if (res.status == 'Success') {
            var html = '';
            $.each(res.response, function(index, value){
                if (value.user_id == token.id) {
                    html += '<div class="card facebook-card">'+
                                '<div class="card-header">'+
                                    '<div class="facebook-avatar"><img src="'+image_url+value.profile_pic+'" width="50" height="50"></div>'+
                                    '<div class="facebook-name" onclick="goto_user_page('+value.user_id+')">'+value.first_name+'</div>'+
                                    '<div class="facebook-date">@'+value.username+'</div>'+
                                '</div>'+
                                '<div class="card-content">'+
                                    '<div class="card-content-inner">'+
                                        '<p>'+decodeURI(value.description)+'</p>'+
                                        '<p>Type of pet: '+value.pet_type+'</p>'+
                                        '<p>Age: '+value.age+'</p>'+
                                        '<p class="color-gray">Likes: '+value.count_fp+'</p>'+
                                    '</div>'+
                                '</div>'+
                                '<div class="card-footer">'+
                                    '<a href="#" class="link" onclick="deleteFindParent('+value.id+');"><i class="material-icons color_8ac640 findParentLike white_heart_active" onclick="findParentLikeStatusChng('+value.id+')" data-feed_id="'+value.id+'">delete</i> DELETE</a>'+
                                '</div>'+
                            '</div>';
                }
            })

            $("#find_parent_mylistDyn").html(html);

            myApp.hideIndicator();
        } else {
            myApp.hideIndicator();
            var html = '<p style="text-align: center;">'+res.api_msg+'</p>';
            $("#find_parent_mylistDyn").html(html);
        }
    }).error(function(res){
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
    });
}

function loadFindParentMyList(user_id) {
    myApp.showIndicator();

    $.ajax({
        url: base_url+'get_my_become_parent_list',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: user_id,
        }
    }).done(function(res){
        if (res.status == 'Success') {
            var html = '';
            $.each(res.response, function(index, value){
                html += '<div class="item">'+
                        '<a class="card-content color_8ac640">'+
                        '<div class="profile_photo">'+
                        '<img src="'+image_url+value.profile_pic+'" width="100%">'+
                        '</div>'+
                        '<div class="content_blocker">'+
                        '<h3 class="mrg0">'+value.pet_name+'</h3>'+
                        '<p class="mrg0">'+value.pet_type+'</p>'+
                        '<p class="mrg0">Age: '+value.age+'</p>'+
                        '<p class="mrg0">'+value.gender+'</p>'+
                        '<br>'+
                        '<p class="mrg0" onclick="deletePetFromAdoption('+value.id+')"><i class="material-icons">delete</i>&nbsp;DELETE</p>'+
                        '<br>'+
                        '</div>'+
                        '</a>'+
                        '</div>';
            })

            $("#become_parent_mylistDyn").html(html);

            myApp.hideIndicator();
        } else {
            myApp.hideIndicator();
            var html = '<p style="text-align: center;">'+res.api_msg+'</p>';
            $("#become_parent_mylistDyn").html(html);
        }
    }).error(function(res){
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
    });
}

function loadBecomeParentContent(user_id) {
    myApp.showIndicator();

    $.ajax({
        url: base_url+'get_become_parent_list',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: user_id,
        }
    }).done(function(res){
        if (res.status == 'Success') {
            var html = '';
            $.each(res.response, function(index, value){
                html += '<div class="item">'+
                        '<a class="card-content color_8ac640" onclick="goto_becomeParentDetails('+value.id+');">'+
                        '<div class="profile_photo">'+
                        '<img src="'+image_url+value.profile_pic+'" width="100%">'+
                        '</div>'+
                        '<div class="content_blocker">'+
                        '<h3 class="mrg0">'+value.pet_name+'</h3>'+
                        '<p class="mrg0">'+value.pet_type+'</p>'+
                        '<p class="mrg0">Age: '+value.age+'</p>'+
                        '<p class="mrg0">'+value.gender+'</p>'+
                        '</div>'+
                        '</a>'+
                        '</div>';
            })

            $("#become_parent_listDyn").html(html);

            myApp.hideIndicator();
        } else {
            myApp.hideIndicator();
            var html = '<p style="text-align: center;">'+res.api_msg+'</p>';
            $("#become_parent_listDyn").html(html);
        }
    }).error(function(res){
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
    });
}

function goto_becomeParentDetails(adoption_id) {
    pet_static_account_id = adoption_id;
    mainView.router.load({
        url: 'become_parent_disp.html',
        ignoreCache: true,
    });
}

function loadBecomeParentDetails(account_id) {
    myApp.showIndicator();

    $.ajax({
        url: base_url+'get_become_parent_details',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: token.id,
            adoption_id: account_id,
        }
    }).done(function(res){
        if (res.status == 'Success') {
            myApp.hideIndicator();
            $(".becomeParentDetailsImage").attr("src", image_url+res.response.profile_pic);
            $(".becomeParentDetailsName").html(res.response.pet_name);
            $(".becomeParentDetailsInfo").html('Breed: '+res.response.breed+', '+res.response.pet_type+' Age: '+res.response.age);
            $(".becomeParentDetailsContent").html(decodeURI(res.response.description));
            if (res.response.interested_status == 1) {
                $(".DymStatusIntersted").html('<i class="material-icons white_heart_active" data-petid="">favorite</i>&nbsp;&nbsp;Interested');
            } else {
                $(".DymStatusIntersted").html('<i class="material-icons" data-petid="">favorite_border</i>&nbsp;&nbsp;Interested');
            }
        } else {
            $(".becomeParentDetailsImage").attr('src', image_url+'cover_pic.jpg');
            $(".becomeParentDetailsName").html('');
            $(".becomeParentDetailsInfo").html('');
            $(".becomeParentDetailsContent").html('');
            myApp.hideIndicator();
            myApp.alert("Something went wrong, Please try agian later!")
        }
    }).error(function(res){
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
    });
}

function loadFindParentContentFilteredContent(user_id) {
    myApp.showIndicator();

    $.ajax({
        url: base_url+'get_find_parent_list_filtered',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: user_id,
            pettype: find_parent_filter_pettype,
        }
    }).done(function(res){
        if (res.status == 'Success') {
            var html = '';
            $.each(res.response, function(index, value){
                html += '<div class="card facebook-card">'+
                            '<div class="card-header">'+
                                '<div class="facebook-avatar"><img src="'+image_url+value.profile_pic+'" width="50" height="50"></div>'+
                                '<div class="facebook-name" onclick="goto_user_page('+value.user_id+')">'+value.first_name+'</div>'+
                                '<div class="facebook-date">@'+value.username+'</div>'+
                            '</div>'+
                            '<div class="card-content">'+
                                '<div class="card-content-inner">'+
                                    '<p>'+decodeURI(value.description)+'</p>'+
                                    '<p>Type of pet: '+value.pet_type+'</p>'+
                                    '<p>Age: '+value.age+'</p>'+
                                    '<p class="color-gray">Likes: '+value.count_fp+'</p>'+
                                '</div>'+
                            '</div>'+
                            '<div class="card-footer">';
                            if (value.like_status == "1") {
                                html += '<a href="#" class="link like_block_chng_active'+value.id+'"><i class="material-icons color_8ac640 findParentLike white_heart_active" onclick="findParentLikeStatusChng('+value.id+')" data-feed_id="'+value.id+'">favorite</i></a>';
                            } else {
                                html += '<a href="#" class="link like_block_chng_active'+value.id+'"><i class="material-icons color_8ac640 findParentLike" onclick="findParentLikeStatusChng('+value.id+')" data-feed_id="'+value.id+'">favorite_border</i></a>';
                            }

                            html += '<a href="#" class="link"><i class="material-icons color_8ac640 checkShareContent'+value.find_parent_id+'" onclick="shareFindParent('+value.find_parent_id+')" data-sharecontent="'+decodeURI(value.description)+'" data-accountid="'+value.find_parent_id+'">share</i></a>'+
                            '</div>'+
                        '</div>';
            })

            $("#find_parent_listDyn").html(html);

            myApp.hideIndicator();
        } else {
            myApp.hideIndicator();
            var html = '<p style="text-align: center;">'+res.api_msg+'</p>';
            $("#find_parent_listDyn").html(html);
        }
    }).error(function(res){
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
    });
}

function loadFindParentContent(user_id) {
    myApp.showIndicator();

    $.ajax({
        url: base_url+'get_find_parent_list',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: user_id,
        }
    }).done(function(res){
        if (res.status == 'Success') {
            var html = '';
            $.each(res.response, function(index, value){
                html += '<div class="card facebook-card">'+
                            '<div class="card-header">'+
                                '<div class="facebook-avatar"><img src="'+image_url+value.profile_pic+'" width="50" height="50"></div>'+
                                '<div class="facebook-name" onclick="goto_user_page('+value.user_id+')">'+value.first_name+'</div>'+
                                '<div class="facebook-date">@'+value.username+'</div>'+
                            '</div>'+
                            '<div class="card-content">'+
                                '<div class="card-content-inner">'+
                                    '<p>'+decodeURI(value.description)+'</p>'+
                                    '<p>Type of pet: '+value.pet_type+'</p>'+
                                    '<p>Age: '+value.age+'</p>'+
                                    '<p class="color-gray">Likes: '+value.count_fp+'</p>'+
                                '</div>'+
                            '</div>'+
                            '<div class="card-footer">';
                            if (value.like_status == "1") {
                                html += '<a href="#" class="link like_block_chng_active'+value.id+'"><i class="material-icons color_8ac640 findParentLike white_heart_active" onclick="findParentLikeStatusChng('+value.id+')" data-feed_id="'+value.id+'">favorite</i></a>';
                            } else {
                                html += '<a href="#" class="link like_block_chng_active'+value.id+'"><i class="material-icons color_8ac640 findParentLike" onclick="findParentLikeStatusChng('+value.id+')" data-feed_id="'+value.id+'">favorite_border</i></a>';
                            }

                            html += '<a href="#" class="link"><i class="material-icons color_8ac640 checkShareContent'+value.find_parent_id+'" onclick="shareFindParent('+value.find_parent_id+')" data-sharecontent="'+decodeURI(value.description)+'" data-accountid="'+value.find_parent_id+'">share</i></a>'+
                            '</div>'+
                        '</div>';
            })

            $("#find_parent_listDyn").html(html);

            myApp.hideIndicator();
        } else {
            myApp.hideIndicator();
            var html = '<p style="text-align: center;">'+res.api_msg+'</p>';
            $("#find_parent_listDyn").html(html);
        }
    }).error(function(res){
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
    });
}

function loadLostFoundContent(user_id) {
    myApp.showIndicator();

    $.ajax({
        url: base_url+'get_lost_found',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: user_id,
        }
    }).done(function(res){
        if (res.status == 'Success') {
            var html = '';
            $.each(res.response, function(index, value) {
                html += '<div class="card demo-card-header-pic">'+
                            '<div style="background-image:url('+image_url+value.cover_pic+')" valign="bottom" class="card-header color-white no-border"></div>'+
                            '<div class="card-content">'+
                                '<div class="card-content-inner">'+
                                    '<h2 class="mrg0">'+value.first_name+', '+value.breed_name+', '+value.age+'</h2>'+
                                    '<p class="color-gray mrg0">Posted By @'+value.parent_username+'</p>'+
                                    '<p class="text_expand text_expand_'+index+'">'+decodeURI(value.lost_description)+'</p>'+
                                '</div>'+
                            '</div>'+
                            '<div class="card-footer">'+
                                '<a href="#" class="link"><i class="material-icons white_heart">share</i></a>'+
                                '<a href="#" class="link color-white click_to_expand" data-trigger=".text_expand_'+index+'">Read More</a>'+
                            '</div>'+
                        '</div>';
            })

            myApp.hideIndicator();
            $("#lost_found_dynamic").html(html);

            $(".click_to_expand").click(function(e){
                $(".text_expand").css('height', '20px');
                var trigger_id = $(this).data('trigger');
                $(trigger_id).css('height', 'auto');
            })
        } else {
            myApp.hideIndicator();
            var html = '<p style="text-align: center;">'+res.api_msg+'</p>';
            $("#lost_found_dynamic").html(html);
        }
    }).error(function(err){
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
    });
}

function goto_profile_list(account_type) {
    account_id = token.id;
    profile_list_type = account_type;
    mainView.router.load({
        url: 'profiles.html',
        ignoreCache: true,
    });
}

function goto_profile_list_follow(type, user_cat) {
    if (user_cat == 'users_sub') {
        account_id = static_account_id;
    } else if (user_cat == 'users') {
        account_id = token.id;
    } else if (user_cat == 'business') {
        account_id = business_static_account_id;
    }
    profile_list_type = type;
    mainView.router.load({
        url: 'profiles.html',
        ignoreCache: true,
    });
}

function loadBusinessProfilesList() {
    myApp.showIndicator();

    $.ajax({
        url: base_url+'list_business_profiles',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: account_id,
            account_type: profile_list_type,
        }
    }).done(function(res){
        if (res.status == 'Success') {
            var html = '';

            $.each(res.response, function(index, value){

                var onclick_html = '';

                if (value.user_type == 'Pet') {
                    onclick_html = 'onclick="goto_profile_shopper_pet('+value.id+');"';
                } else if (value.user_type == 'Business') {
                    onclick_html = 'onclick="goto_business_page('+value.id+')"';
                } else {
                    onclick_html = 'onclick="goto_user_page('+value.id+')"';
                }

                if (value.id == token.id || value.linked_acc_id == token.id) {
                    html += '<li class="item-content read_active">';
                } else {
                    html += '<li class="item-content read_active">';
                }

                    html += '<div class="item-content">'+
                                '<div class="item-media pad0">'+
                                    '<img src="'+image_url+value.profile_image+'" width="75" height="75">'+
                                '</div>'+
                                '<div class="item-inner">'+
                                    '<div class="item-title-row">'+
                                        '<div class="item-title" '+onclick_html+'>'+value.first_name+'</div>'+
                                    '</div>'+
                                    '<div class="item-subtitle">'+value.username+'</div>'+
                                '</div>'+
                            '</div>';
                html += '</li>';



            })

            $("#list_profiles_dynamic").html(html);

            myApp.hideIndicator();

        } else {
            myApp.hideIndicator();
            var html = '<p style="text-align: center;">'+res.api_msg+'</p>';
            $("#list_profiles_dynamic").html(html);
        }
    }).error(function(err){
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
    });
}

function loadProfilesList(account_id, profile_list_type) {
    myApp.showIndicator();

    $.ajax({
        url: base_url+'list_profiles',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: account_id,
            account_type: profile_list_type,
        }
    }).done(function(res){
        if (res.status == 'Success') {
            var html = '';

            $.each(res.response, function(index, value){

                var onclick_html = '';

                if (value.user_type == 'Pet') {
                    onclick_html = 'onclick="goto_profile_shopper_pet('+value.id+');"';
                } else if (value.user_type == 'Business') {
                    onclick_html = 'onclick="goto_business_page('+value.id+')"';
                } else {
                    onclick_html = 'onclick="goto_user_page('+value.id+')"';
                }

                // html += '<li class="item-content read_active">'+
                //             '<div class="swipeout-content item-content">'+
                //                 '<div class="item-media pad0">'+
                //                     '<img src="'+image_url+value.profile_image+'" width="75" height="75">'+
                //                 '</div>'+
                //                 '<div class="item-inner">'+
                //                     '<div class="item-title-row">'+
                //                         '<div class="item-title" '+onclick_html+'>'+value.first_name+'</div>'+
                //                     '</div>'+
                //                     '<div class="item-subtitle">'+value.username+'</div>'+
                //                 '</div>'+
                //             '</div>'+
                //         '</li>';

                if (value.id == token.id || value.linked_acc_id == token.id) {
                    html += '<li class="swipeout item-content read_active">';
                } else {
                    html += '<li class="item-content read_active">';
                }

                    html += '<div class="swipeout-content item-content">'+
                                '<div class="item-media pad0">'+
                                    '<img src="'+image_url+value.profile_image+'" width="75" height="75">'+
                                '</div>'+
                                '<div class="item-inner">'+
                                    '<div class="item-title-row">'+
                                        '<div class="item-title" '+onclick_html+'>'+value.first_name+'</div>'+
                                    '</div>'+
                                    '<div class="item-subtitle">'+value.username+'</div>'+
                                '</div>'+
                            '</div>';
                    if (value.id == token.id || value.linked_acc_id == token.id) {
                        html += '<div class="swipeout-actions-right">'+
                                    '<a href="#" data-userid="'+value.id+'" class="action1 delete_profile">Delete</a>'+
                                '</div>';
                    }
                html += '</li>';



            })

            $("#list_profiles_dynamic").html(html);

            myApp.hideIndicator();

            $(".delete_profile").click(function(e){
                e.preventDefault();
                var acc_id = $(this).data('userid');
                myApp.showIndicator();
                $.ajax({
                    url: base_url+'delete_users_profiles',
                    type: 'POST',
                    dataType: 'json',
                    crossDomain: true,
                    data: {acc_id: acc_id}
                }).done(function(res) {
                    myApp.hideIndicator();
                    myApp.alert(res.api_msg);
                    goto_profile();
                }).error(function(res) {
                    myApp.hideIndicator();
                    myApp.alert("Something went wrong, Please try again later!");
                })
            })
        } else {
            myApp.hideIndicator();
            var html = '<p style="text-align: center;">'+res.api_msg+'</p>';
            $("#list_profiles_dynamic").html(html);
        }
    }).error(function(err){
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
    });
}

function loadSearchList() {
    myApp.showIndicator();
    $.ajax({
        url: base_url+'search_list',
        type: 'POST',
        crossDomain: true,
        data: {
            user_id: token.id,
            search_term: $("#search_all").val(),
        }
    }).done(function(res){
        myApp.hideIndicator();
        $("#search-list-users > ul").html('Loading users...');
        var html = '';
        $.each(res.response.users_list, function(index, value){
            html += '<li class="item-content pad0">'+
                        '<div class="item-inner">';

            if (value.user_type == 'Pet') {
                html += '<div class="item-content" onclick="goto_profile_shopper_pet('+value.id+');">';
            } else if (value.user_type == 'Business') {
                html += '<div class="item-content" onclick="goto_business_page('+value.id+');">';
            } else {
                html += '<div class="item-content" onclick="goto_user_page('+value.id+');">';
            }
                        html += '<div class="item-media pad0">'+
                                    '<img src="'+image_url+value.profile_image+'" width="75" height="75">'+
                                '</div>'+
                                '<div class="item-inner">'+
                                    '<div class="item-title-row">'+
                                        '<div class="item-title">'+value.first_name+'</div>'+
                                        '<div class="item-subtitle">'+value.user_type+' Profile</div>'+
                                    '</div>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</li>';
        })

        if (html) {
            $("#search-list-users > ul").html(html);
        } else {
            $("#search-list-users > ul").html('There no listing availabel for this search!');
        }


        var html = '';
        $("#search-list-feeds > ul").html('Loading feeds...');
        $.each(res.response.feeds_list, function(index, value){
            html += '<li class="item-content">'+
                        '<div class="item-inner">'+
                            '<div class="card c_ard ks-facebook-card" style="width: 100%">'+
                                '<div class="black_overlay"></div>'+
                                    '<a href="#" class="card-header no-border pro_view">'+
                                        '<div class="ks-facebook-avatar pro_pic">'+
                                            '<img src="'+image_url+value.profile_image+'" width="34" height="34">'+
                                        '</div>'+
                                        '<div class="ks-facebook-name pro_name item-title">'+value.first_name+'</div>'+
                                        '<div class="ks-facebook-date pro_tag item-title">'+decodeURI(value.feeds_content).substring(0, 50)+'</div>'+
                                        '<div class="ks-facebook-date pro_tag">0 Comments 0 Likes</div>'+
                                    '</a>'+
                                    '<a class="card-content" onclick="load_feed_page('+value.feed_id+');" href="javascript:void(0)">'+
                                        '<img data-src="'+image_url+value.image+'" src="'+image_url+value.image+'" width="100%" class="lazy lazy-fadein">'+
                                    '</a>'+
                                    '<div class="card-footer no-border like_share">';

                            html += '</div>'+
                                '</div>'+
                            '</div>'+
                        '</li>';
        })

        if (html) {
            $("#search-list-feeds > ul").html(html);
        } else {
            $("#search-list-feeds > ul").html('There no listing availabel for this search!');
        }

        $("#search-list-feeds > ul").html(html);

        $(".subnavbar").removeClass('hide');
    }).error(function(res){
        myApp.hideIndicator();
    }).always(function(res){
        myApp.hideIndicator();
    })

    return false;
}

function goto_user_page(user_id) {
    static_account_id = user_id;
    mainView.router.load({
        url: 'profile_shopper_sub.html',
        ignoreCache: true,
    });
}

function loadChatsList() {
    myApp.showIndicator();
    $.ajax({
        url: base_url+'load_chat_list',
        type: 'POST',
        crossDomain: true,
        data: {
            user_id: token.id,
        }
    }).done(function(res){
        if (res.status == 'Success') {
            var html = '';

            $("#dyn_chats_list > ul").html('Loading Chat List...');
            // $("#dyn_chats_list_business > ul").html('Loading Chat List...');

            $.each(res.response.chats_list, function(index, value) {
                var time = new Date(value.created_date);
                var receiver_id = value.user_id;
                var timechng = time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
                if (value.read_status == 1) {
                    html += '<li class="swipeout item-content messages_from_id_'+value.id+'" onclick="goto_chat_inner('+receiver_id+', '+token.id+')">';
                } else {
                    html += '<li class="swipeout item-content messages_from_id_'+value.id+' read_active" onclick="goto_chat_inner('+receiver_id+', '+token.id+')">';
                }
                    html += '<div class="swipeout-content item-content">'+
                                '<div class="item-media pad0">'+
                                    '<img src="'+image_url+value.profile_image+'" width="75" height="75">'+
                                '</div>'+
                                '<div class="item-inner">'+
                                    '<div class="item-title-row">'+
                                        '<div class="item-title text-left">'+value.first_name+'<span class="time-text">'+timechng+'</span>'+
                                        '</div>'+
                                    '</div>'+
                                    '<div class="item-subtitle text-left">'+decodeURI(value.messages)+'</div>'+
                                '</div>'+
                            '</div>'+
                            '<div class="swipeout-actions-right">'+
                                '<a href="#" data-messageid="'+value.id+'" class="action1 change_message_read_status">Mark Read</a>'+
                                '<a href="#" data-profileaccid="'+receiver_id+'" onclick="deleteMessages('+receiver_id+')" class="action1 delete_message">Delete</a>'+
                            '</div>'+
                        '</li>';
            })

            if (html) {
                $("#dyn_chats_list > ul").html(html);
            } else {
                $("#dyn_chats_list > ul").html('You do not have chat list.');
            }

            var html = '';

            $.each(res.response.chats_list_business, function(index, value) {
                var time = new Date(value.created_date);
                var receiver_id = value.user_id;
                var timechng = time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
                if (value.read_status == 1) {
                    html += '<li class="swipeout item-content messages_from_id_'+value.id+'" onclick="goto_chat_inner('+receiver_id+', '+value.sender_id+')">';
                } else {
                    html += '<li class="swipeout item-content messages_from_id_'+value.id+' read_active" onclick="goto_chat_inner('+receiver_id+', '+value.sender_id+')">';
                }
                    html += '<div class="swipeout-content item-content">'+
                                '<div class="item-media pad0">'+
                                    '<img src="'+image_url+value.profile_image+'" width="75" height="75">'+
                                '</div>'+
                                '<div class="item-inner">'+
                                    '<div class="item-title-row">'+
                                        '<div class="item-title text-left">'+value.first_name+'<span class="time-text">'+timechng+'</span>'+
                                        '</div>'+
                                    '</div>'+
                                    '<div class="item-subtitle text-left">'+decodeURI(value.messages)+'</div>'+
                                '</div>'+
                            '</div>'+
                            '<div class="swipeout-actions-right">'+
                                '<a href="#" data-messageid="'+value.id+'" class="action1 change_message_read_status">Mark Read</a>'+
                                '<a href="#" data-profileaccid="'+receiver_id+'" onclick="deleteMessages('+receiver_id+')" class="action1 delete_message">Delete</a>'+
                            '</div>'+
                        '</li>';
            })

            if (html) {
                $("#dyn_chats_list_business > ul").html(html);
            } else {
                $("#dyn_chats_list_business > ul").html('You do not have chat list.');
            }

            $(".change_message_read_status").click(function(e){
                e.preventDefault();
                var chng_status_clas = ".messages_from_id_"+$(this).data('messageid');
                $.ajax({
                    url: base_url+'change_message_read_status',
                    type: 'POST',
                    crossDomain: true,
                    data: {
                        message_id: $(this).data('messageid'),
                        user_id: token.id,
                    }
                }).done(function(res){
                    if (res.status == 'Success') {
                        $(chng_status_clas).removeClass('read_active');
                    } else {
                        myApp.alert('Some error occured while updating the status!');
                    }
                }).error(function(res){
                    myApp.alert('Some error occured while updating the status!');
                })
            })

            myApp.hideIndicator();
        } else {
            myApp.alert(res.api_msg);
            myApp.hideIndicator();
        }
    }).error(function(res){
        myApp.alert('Something went wrong, Please check your connection!');
        myApp.hideIndicator();
    }).always(function(res){
        myApp.hideIndicator();
    })
}

function deleteMessages(user_id) {
    myApp.confirm('would you like to delete all the messages?', function() {
        myApp.showIndicator();
        $.ajax({
            url: base_url+'delete_chats',
            type: 'POST',
            crossDomain: true,
            data: {
                acc_id: token.id,
                profile_acc_id: user_id,
            }
        }).done(function(res){
            myApp.hideIndicator();
            if (res.status == 'Success') {
                goto_page('feeds.html');
            } else {
                myApp.alert('Some error occured while updating the status!');
            }
        }).error(function(res){
            myApp.hideIndicator();
            myApp.alert('Some error occured while updating the status!');
        })
    });
}

function goto_chat_inner(user_id, receiver_id) {
    static_account_id = user_id;
    chat_receiver_id = receiver_id;
    mainView.router.load({
        url: 'chat.html',
        ignoreCache: true,
    });
}


function send_chat() {
    var user_id = chat_receiver_id;
    var acc_id = $(".chat_reviever_id").html();
    var message = $("#mesage_sent").val();
    if (!message) {
        return false;
    } else {
        myApp.showIndicator();

        $.ajax({
            url: base_url + 'creat_chat',
            type: 'POST',
            crossDomain: true,
            data: {
                user_id: user_id, acc_id: acc_id, message: encodeURI(message),
            }
        }).done(function(res){
            if (res.status == 'Success') {
                myApp.hideIndicator();
                html = '<div class="message message-sent">'+
                            '<div class="message-text">'+decodeURI(message)+'</div>'+
                            '<div style="background-image:url('+image_url+chat_image_link+')" class="message-avatar"></div>'+
                        '</div>';
                $("#messages_box_dyn").append(html);

                var myMessages = myApp.messages('.messages', {
                    scrollMessages: true,
                });

                $("#mesage_sent").val('');
            } else {
                myApp.hideIndicator();
                myApp.alert("Network Error Occured, Please try again later!");
            }
        }).error(function(res){
            myApp.hideIndicator();
            myApp.alert("Network Error Occured, Please try again later!");

        })
    }
}

function loadChatMessages(user_id, acc_id) {
    myApp.showIndicator();

    $(".chat_reviever_id").html(user_id);
    
    $.ajax({
        url: base_url+'load_chat_messages',
        type: 'POST',
        crossDomain: true,
        data: {
            user_id: acc_id,
            acc_id: user_id,
        }
    }).done(function(res){
        var html = '';

        $("#messages_box_dyn").html('');

        if (res.status == 'Success') {
            var profile_receiver_id = '';

            var receiver_profile = image_url+res.users_details.profile_image;
            var profile_user_type = res.users_details.user_type;

            $.each(res.response, function(index, value) {
                profile_receiver_id = value.sender_id;
                chat_image_link = value.sender_profile_image;
                var click_trigger = '';

                if (profile_user_type == 'User') {
                    click_trigger = 'onclick="goto_user_page('+profile_receiver_id+')"';
                } else {
                    click_trigger = 'onclick="goto_business_page('+profile_receiver_id+')"';
                }

                var additional_content = '';
                if (value.message_type == 'Adoption') {
                    additional_content = '<a href="javascript:void(0)" onclick="goto_becomeParentDetails('+value.message_page_id+')">View More</a>';
                } else if (value.message_type == 'Profile') {
                    additional_content = '<a href="javascript:void(0)" onclick="goto_profile_shopper_pet('+value.message_page_id+')">View More</a>';
                } else if (value.message_type == 'Feed') {
                    additional_content = '<a href="javascript:void(0)" onclick="load_feed_page('+value.message_page_id+')">View More</a>';
                } else if (value.message_type == 'PetProfile') {
                    additional_content = '<a href="javascript:void(0)" onclick="goto_profile_shopper_pet('+value.message_page_id+')">View More</a>';
                } else {
                    additional_content = '';
                }
 
                if (value.sender_id == chat_receiver_id) {

                    if (value.image) {
                        html += '<div class="message message-sent">'+
                                    '<div class="message-text"><img src="'+value.image+'" width="100%">'+decodeURI(value.messages)+' '+additional_content+'</div>'+
                                    '<div style="background-image:url('+image_url+value.sender_profile_image+')" class="message-avatar"></div>'+
                                '</div>';
                    } else {
                        html += '<div class="message message-sent">'+
                                    '<div class="message-text">'+decodeURI(value.messages)+' '+additional_content+'</div>'+
                                    '<div style="background-image:url('+image_url+value.sender_profile_image+')" class="message-avatar"></div>'+
                                '</div>';
                    }
                } else {
                    if (value.image) {
                        html += '<div class="message message-received">'+
                                    '<div class="message-text"><img src="'+value.image+'" width="100%"">'+decodeURI(value.messages)+' '+additional_content+'</div>'+
                                    '<div '+click_trigger+' style="background-image:url('+receiver_profile+')" class="message-avatar"></div>'+
                                '</div>';
                    } else {
                        html += '<div class="message message-received">'+
                                    '<div class="message-text">'+decodeURI(value.messages)+' '+additional_content+'</div>'+
                                    '<div '+click_trigger+' style="background-image:url('+receiver_profile+')" class="message-avatar"></div>'+
                                '</div>';
                    }
                }

                // <div class="messages-date">Sunday, Feb 9 <span>12:58</span></div>
                // <div class="message message-sent">
                //     <div class="message-text">Yo!</div>
                //     <div style="background-image:url(img/twinkle_profile_pic.png)" class="message-avatar"></div>
                // </div>
                // <div class="message message-sent">
                //     <div class="message-text">I went to the adoption center yesterday</div>
                //     <div style="background-image:url(img/twinkle_profile_pic.png)" class="message-avatar"></div>
                // </div>
                // <div class="message message-received">
                //     <div class="message-text">Yo</div>
                //     <div style="background-image:url(img/sid_profile_pic.png)" class="message-avatar"></div>
                // </div>
                // <div class="message message-received">
                //     <div class="message-text">did you find something?</div>
                //     <div style="background-image:url(img/sid_profile_pic.png)" class="message-avatar"></div>
                // </div>
                // <div class="messages-date">Sunday, Feb 10 <span>11:58</span></div>
                // <div class="message message-sent">
                //     <div class="message-text">Yes, I ll Send you a pic</div>
                //     <div style="background-image:url(img/twinkle_profile_pic.png)" class="message-avatar"></div>
                // </div>
                // <div class="message message-sent message-pic">
                //     <div class="message-text"><img src="https://pawsforprogress.co.uk/wp-content/uploads/2018/03/26233171-10154962083821455-5547238076054156425-o_1_orig-225x300.jpg"></div>
                //     <div style="background-image:url(img/twinkle_profile_pic.png)" class="message-avatar"></div>
                // </div>
                // <div class="message message-received">
                //     <div class="message-text">Wow, awesome!</div>
                //     <div style="background-image:url(img/sid_profile_pic.png)" class="message-avatar"></div>
                // </div>
                // <div class="message message-received">
                //     <div class="message-text">Yo</div>
                //     <div style="background-image:url(img/sid_profile_pic.png)" class="message-avatar"></div>
                // </div>
            })

            $("#messages_box_dyn").html(html);

            var receiver_name = '';

            if (profile_user_type == 'User') {
                receiver_name = '<span onclick="goto_user_page('+profile_receiver_id+')">'+res.users_details.first_name+'</span>';
            } else {
                receiver_name = '<span onclick="goto_business_page('+profile_receiver_id+')">'+res.users_details.first_name+'</span>';
            }

            $(".chat_reviever_img").attr('src', receiver_profile);
            $(".chat_reviever_name").html(receiver_name);

            var myMessages = myApp.messages('.messages', {
                scrollMessages: true,
            });
        }
        
        myApp.hideIndicator();
    }).error(function(res){
        myApp.hideIndicator();
        myApp.alert("Some error occured, Please try again later!");
    })
}

function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

function load_location_after_city_load_for_edit_profile_shopper() {
    $('#edit_profile_shopper-location_select').val(user_data.location_id);
}

function update_shopper_profile() {
    var name = $('#edit_profile_shopper-name').val().trim();
    var email = $('#edit_profile_shopper-email').val().trim();
    var username = $('#edit_profile_shopper-username').val().trim();
    var city_id = $('#edit_profile_shopper-city_select').val();
    var gender = $('input[name=edit_profile_shopper-gender]:checked').val();
    var profile_image = profile_image_link;
    var cover_image = profile_cover_image_link;
    var phone = $('#edit_profile_shopper-phone').val().trim();

    if (name == '') {
        myApp.alert('Please provide name.');
        return false;
    }

    if (username == '') {
        myApp.alert('Please provide username.');
        return false;
    }

    if (email == '') {
        myApp.alert('Please provide email id.');
        return false;
    }

    if (!email.match(email_regex)) {
        myApp.alert('Please provide valid email id.');
        return false;
    }

    if (city_id == '') {
        myApp.alert('Please provide city.');
        return false;
    }

    if (!gender) {
        myApp.alert('Please select gender.');
        return false;
    }

    if (profile_image == '') {
        myApp.alert('Please upload profile image.');
        return false;
    }

    if (cover_image == '') {
        myApp.alert('Please upload cover image.');
        return false;
    }

    myApp.showIndicator();
    $.ajax({
        url: base_url + 'update_user',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            id: token.id,
            identity: email,
            username: username,
            first_name: name,
            city_id: city_id,
            gender: gender,
            cover_pic: cover_image,
            phone: phone,
            profile_image: profile_image,
        },
    })
    .done(function(res) {
        myApp.hideIndicator();
        if (res.status == 'success') {
            myApp.alert('Successfully updated.');
            goto_profile();
            // mainView.router.refreshPage();
        } else {
            myApp.alert(res.api_msg);
        }
    })
    .fail(function(err) {
        myApp.hideIndicator();
        // myApp.alert("error: "+j2s(err));
    })
    .always(function() {
    });
}

function load_edit_profile_pet(user_id) {
    myApp.showIndicator();
    $.ajax({
        url: base_url + 'get_user',
        type: 'POST',
        crossDomain: true,
        async: false,
        data: {
            user_id: user_id
        },
    })
    .done(function(res) {
        myApp.hideIndicator();
        if (res.status = 'Success') {
            user_data = res.response.user_details;

            $("#edit_pet_register-id").val(user_id);

            $("#edit_pet_register-name").val(user_data.first_name);
            // $("#edit_pet_register-username").val(user_data.username);
            $("#edit_pet_register-age").val(user_data.age);
            $("#edit_pet_register-description").val(user_data.description);

            load_pet_categories("#edit_pet_register-pettype", function() { $("#edit_pet_register-pettype").val(user_data.type_of_pet); });
            load_city("#edit_pet_register-city", function(){ $("#edit_pet_register-city").val(user_data.city); });

            $("#edit_pet_register-pettype").change(function(e) {
                e.preventDefault();
                if ($("#edit_pet_register-pettype").val() == 'Select Pet Type') {
                    myApp.alert("Please select the Pet Type");
                } else {
                    load_breed_dropdown($("#edit_pet_register-pettype").val(), '#edit_pet_register-breed', function(){});
                }
            })

            $("#edit_pet_register-pettype").val(user_data.type_of_pet);

            load_breed_dropdown(user_data.type_of_pet, "#edit_pet_register-breed", function(){ $("#edit_pet_register-breed").val(user_data.breed); });

            $('input[name=edit_profile_pet-gender][value='+user_data.gender+']').attr('checked', true); 

            profile_image_link = user_data.profile_image;
            profile_cover_image_link = user_data.cover_pic;
        } else {
            myApp.alert('Some error occurred');
        }        
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Some error occurred');
    }).always();
}

function edit_pet() {
    var id = $("#edit_pet_register-id").val();
    var name = $("#edit_pet_register-name").val();
    // var username = $("#edit_pet_register-username").val();
    var pettype = $("#edit_pet_register-pettype").val();
    var breed = $("#edit_pet_register-breed").val();
    var age = $("#edit_pet_register-age").val();
    var city = $("#edit_pet_register-city").val();
    // var description = $("#edit_pet_register-description").val();
    var gender = $('input[name=edit_profile_pet-gender]:checked').val();
    var profile_image = profile_image_link;
    var cover_pic = profile_cover_image_link;

    if (!name) {
        myApp.alert('Please provide name');
        return false;
    }

    // if (!username) {
    //     myApp.alert('Please provide username');
    //     return false;
    // }

    if (!pettype || pettype == 'Select Pet Type') {
        myApp.alert('Please provide pet type');
        return false;
    }

    if (!breed || breed == 'Select Pet Type') {
        myApp.alert('Please provide breed');
        return false;
    }

    if (!age) {
        myApp.alert('Please provide age');
        return false;
    }

    if (!city) {
        myApp.alert('Please provide city');
        return false;
    }

    if (!gender) {
        myApp.alert('Please provide gender');
        return false;
    }

    // if (!description) {
    //     myApp.alert('Please provide description');
    //     return false;
    // }

    // if (!profile_image) {
    //     myApp.alert('Please provide profile image');
    //     return false;
    // }

    if (!cover_pic) {
        myApp.alert('Please provide cover picture');
        return false;
    }

    myApp.showIndicator();
    $.ajax({
        url: base_url + 'update_pet',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            id: id,
            username: name,
            first_name: name,
            type_of_pet: pettype,
            breed: breed,
            city: city,
            age: age,
            gender: gender,
            profile_image: cover_pic,
            cover_pic: cover_pic,
        },
    })
    .done(function(res) {
        myApp.hideIndicator();
        if (res.status == 'success') {
            myApp.alert('Successfully updated.');
            goto_profile_shopper_pet(res.response.id);
            // mainView.router.refreshPage();
        } else {
            myApp.alert(res.api_msg);
        }
    })
    .fail(function(err) {
        myApp.hideIndicator();
        console.log("error: " + j2s(err));
        // myApp.alert("error: "+j2s(err));
    })
    .always(function() {
    });

}

function load_edit_profile_shopper() {
    myApp.showIndicator();
    $.ajax({
        url: base_url + 'get_user',
        type: 'POST',
        crossDomain: true,
        async: false,
        data: {
            user_id: token.id
        },
    })
    .done(function(res) {
        myApp.hideIndicator();
        if (res.status = 'Success') {
            user_data = res.response.user_details;

            load_city('#edit_profile_shopper-city_select', function(){ $('#edit_profile_shopper-city_select').val(user_data.city); });

            $('#edit_profile_shopper-city_select').change(function(event) {
                var city_id = $(this).val();
                load_location('#edit_profile_shopper-location_select', city_id, function(){});
            });

            load_location('#edit_profile_shopper-location_select', user_data.city_id, load_location_after_city_load_for_edit_profile_shopper);

            $('#edit_profile_shopper-username').val(user_data.username);
            $('#edit_profile_shopper-name').val(user_data.first_name);
            $('#edit_profile_shopper-email').val(user_data.email);
            $('#edit_profile_shopper-phone').val(user_data.phone);

            $('input[name=edit_profile_shopper-gender][value='+user_data.gender+']').attr('checked', true); 

            profile_image_link = user_data.profile_image;
            profile_cover_image_link = user_data.cover_pic;
        } else {
            myApp.alert('Some error occurred');
        }        
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Some error occurred');
    }).always();
}

function load_edit_profile_business(user_id) {
    myApp.showIndicator();
    $.ajax({
        url: base_url + 'get_user',
        type: 'POST',
        crossDomain: true,
        data: {
            user_id: user_id
        },
    })
    .done(function(res) {
        myApp.hideIndicator();
        if (res.status = 'success') {
            user_data = res.response.user_details;

            load_city('#edit_profile_business-city_select', function(){ $('#edit_profile_business-city_select').val(user_data.city); });

            // $('#edit_profile_business-city_select').change(function(event) {
            //     var city = $(this).val();
            //     load_location('#edit_profile_business-location_select', city, function(){});
            // });

            // load_location('#edit_profile_business-location_select', user_data.city, load_location_after_city_load_for_edit_profile_business(user_data.location_id));

            var category_arr = [];

            if (user_data.business_category) {
                category_arr = user_data.business_category.split(',');
            }

            load_category('#edit_profile_business-category', function(){ $("#edit_profile_business-category").val(category_arr); });

            $("#edit_profile_business-category").on('change', function(){
                if ($("#edit_profile_business-category").val() == 'Type Your Own') {
                    $(".category_input-register").removeClass('hideInput');
                }
            })

            $('#edit_profile_business-id').val(user_data.id);
            $('#edit_profile_business-username').val(user_data.username);
            $('#edit_profile_business-name').val(user_data.first_name);
            $('#edit_profile_business-buissness').val(user_data.company);
            $('#edit_profile_business-email').val(user_data.email);
            $('#edit_profile_business-phone').val(user_data.phone);
            $('#edit_business_register-address').val(user_data.address);

            // $("#edit_business_register-lat").val(user_data.lat);
            // $("#edit_business_register-lng").val(user_data.lng);

            // initialize(user_data.lat, user_data.lng, 'edit_mapCanvas');

            // $('input[name=edit_profile_business-gender][value='+user_data.gender+']').attr('checked', true); 

            profile_image_link = user_data.profile_image;
            profile_cover_image_link = user_data.cover_pic;
        } else {
            myApp.alert('Some error occurred');
        }
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Some error occurred');
    }).always();
}

function load_location(selector, city_id, callback) {
    $.ajax({
        url: base_url + 'get_location',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            city_id: city_id,
        },
    })
    .done(function(res) {
        if (res.status == 'success') {
            html = '<option value="">Select Location</option>';
            $.each(res.data, function(index, val) {
                html += '<option value="' + val.id + '">' + val.name + '</option>';
            });
            $(selector).html(html);
            callback();
        }
    })
    .fail(function(err) {
        console.log("error: " + err);
    })
    .always(function() {
    });
}

function load_location_after_city_load_for_edit_profile_business(location_id) {
    $('#edit_profile_business-location_select').val(location_id);
}

function edit_business() {
    var id = $('#edit_profile_business-id').val();
    var email = $('#edit_profile_business-email').val().trim();
    var username = $('#edit_profile_business-username').val().trim();
    var city = $('#edit_profile_business-city_select').val();
    var phone = $('#edit_profile_business-phone').val().trim();
    var business_name = $('#edit_profile_business-buissness').val().trim();
    var category = $('#edit_profile_business-category').val();
    var address = $('#edit_business_register-address').val();
    var profile_image = profile_image_link;
    var cover_pic = profile_cover_image_link;
    var new_category = '';

    if (username == '') {
        myApp.alert('Please provide email.');
        return false;
    }
    if (email == '') {
        myApp.alert('Please provide email.');
        return false;
    }
    if (!email.match(email_regex)) {
        myApp.alert('Please provide valid email id.');
        return false;
    }
    if (!phone.match(phone_regex)) {
        myApp.alert('Please enter valid phone number.');
        return false;
    }
    if (business_name==''){
        myApp.alert('Please provide business name.');
        return false;
    }
    if (city == '') {
        myApp.alert('Please provide city.');
        return false;
    }
    if (profile_image == '') {
        myApp.alert('Please upload profile image.');
        return false;
    }
    if (!category) {
        if (!$("#edit_business_register-categoryInput").val()) {
            myApp.alert('Please select category.');
            return false;
        } else {
            category = $("#edit_business_register-categoryInput").val();
            new_category = $("#edit_business_register-categoryInput").val();
        }
    }

    myApp.showIndicator();
    $.ajax({
        url: base_url + 'update_business',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            id: id,
            email: email,
            username: username,
            city: city,
            phone: phone,
            business_name: business_name,
            category: category.toString(),
            address: address,
            profile_image: profile_image,
            cover_pic: cover_pic,
            new_category: new_category,
        },
    })
    .done(function(res) {
        myApp.hideIndicator();
        if (res.status == 'success') {
            myApp.alert('Successfully updated.');

            // goto_business_page(res.response.id);
            goto_profile();
        } else {
            myApp.alert(res.api_msg);
        }
    })
    .fail(function(err) {
        myApp.hideIndicator();
        console.log("error: " + j2s(err));
    })
    .always(function() {
    });
}

function filter_find_parent() {
    find_parent_filter_pettype = $("#find_parent_filter-pettype").val();
    find_parent_filter_breed = $("#find_parent_filter-breed").val();
    find_parent_filter_age = $("#find_parent_filter-age").val();

    if ($("#find_parent_filter-Male").is(":checked")) {
        find_parent_filter_gender = 'Male';
    }

    if ($("#find_parent_filter-Female").is(":checked")) {
        find_parent_filter_gender = 'Female';
    }

    if (!find_parent_filter_pettype) {
        myApp.alert("Please select Pet Type!");
        return false;
    }
    // if (!find_parent_filter_breed) {
    //     myApp.alert("Please select Breed!");
    //     return false;
    // }
    // if (!find_parent_filter_age) {
    //     myApp.alert("Please enter age!");
    //     return false;
    // }
    // if (!find_parent_filter_gender) {
    //     myApp.alert("Please select gender!");
    //     return false;
    // }

    mainView.router.load({
        url: 'become_parent_list_filtered.html',
        ignoreCache: true,
    });
}

function filter_become_parent() {
    find_parent_filter_pettype = $("#become_parent_filter-pettype").val();

    // if ($("#find_parent_filter-Male").is(":checked")) {
    //     find_parent_filter_gender = 'Male';
    // }

    // if ($("#find_parent_filter-Female").is(":checked")) {
    //     find_parent_filter_gender = 'Female';
    // }

    if (!find_parent_filter_pettype) {
        myApp.alert("Please select Pet Type!");
        return false;
    }
    // if (!find_parent_filter_breed) {
    //     myApp.alert("Please select Breed!");
    //     return false;
    // }
    // if (!find_parent_filter_age) {
    //     myApp.alert("Please enter age!");
    //     return false;
    // }
    // if (!find_parent_filter_gender) {
    //     myApp.alert("Please select gender!");
    //     return false;
    // }

    mainView.router.load({
        url: 'find_parent_list_filtered.html',
        ignoreCache: true,
    });
}


function load_dating_profiles(account_id) {
    $.ajax({
        url: base_url + 'get_dating_profiles',
        type: 'POST',
        crossDomain: true,
        data: {
            user_id: account_id,
        }
    }).done(function(res){
        var html = '';
        if (res.status == 'Success') {

            var html = "";

            var pet_like_acc = '';

            $.each(res.response, function(index, value){
                if (index == 0) {
                    pet_like_acc = value.id;
                }
                html += '<div data-accid="'+value.id+'">'+
                            '<div class="card-content">'+
                                '<div class="card-content-inner" style="padding: 0 !important">'+
                                    '<img src="'+image_url+value.profile_image+'" width="100%" class="lazy lazy-fadein" style="margin: 0 auto; width: 80%; border-radius: 10px;">'+
                                '</div>'+
                            '</div>'+
                            '<div class="card-header text-center content_contain">'+
                                '<h2 class="mrg0">'+value.first_name+'</h2>'+
                                '<p>Breed: '+value.breed_name+' | Age: '+value.age+' | '+value.gender+'</p>'+
                            '</div>'+
                        '</div>';
            })

            $(".dating-slider").html(html);

            $(".dating-slider").slick({
                autoplay: false,
                verticalSwiping: false,
                dots: false,
                nextArrow: $("#pet_dating_next"),
                prevArrow: $("#pet_dating_prev"),
            });

            $('.dating-slider').on('afterChange', function(event, slick, currentSlide, nextSlide) {
                pet_like_acc = $('.slick-current').data('accid');
                $('#pet_dating_like_profile').removeClass('pro_file_icons_like_active');
            });

            $("#pet_dating_like_profile").click(function(e){
                e.preventDefault();
                if (!pet_like_acc) {
                } else {
                    console.log(pet_like_acc);
                    $.ajax({
                        url: base_url+'add_to_dating',
                        type: 'post',
                        crossDomain: true,
                        data: {
                            pet_id: pet_like_acc,
                            pet_user_id: account_id,
                            user_id: token.id,
                        }
                    }).done(function(res){
                        console.log(res);
                    }).error(function(res){
                        console.log(res);
                    })
                }
            })


            $(".pro_file_icons_like").click(function() {
                $(this).addClass("pro_file_icons_like_active");
            });
        } else {
            $(".dating-slider").html('<p class="text-center">'+res.api_msg+'</p>');
        }
    }).error(function(res){
        $(".dating-slider").html('Data not available!');
    })
}

function load_profile_content(account_id) {
    $.ajax({
        url: base_url + 'get_pet_profile_data',
        type: 'POST',
        crossDomain: true,
        data: {
            user_id: account_id,
        }
    }).done(function(res){
        var html = '';
        if (res.status == 'Success') {
            // $(".profie_image").attr('src', image_url+res.response.profile_image);
            // $(".cover_image").attr('src', image_url+res.response.cover_pic);
            // $(".p_name").attr('src', image_url+res.response.first_name);
            var html = "";

            $.each(res.response, function(index, value){
                console.log(value.profile_image);
                html += '<div>'+
                            '<div class="card-content">'+
                                '<div class="card-content-inner" style="padding: 0 !important">'+
                                    '<img src="'+image_url+value.profile_image+'" width="100%" class="lazy lazy-fadein">'+
                                '</div>'+
                            '</div>'+
                            '<div class="card-header text-center content_contain">'+
                                '<h2 class="mrg0">'+value.first_name+'</h2>'+
                                '<p>Breed: Labrador | Age: '+value.age+' | '+value.gender+'</p>'+
                            '</div>'+
                        '</div>';
            })
        }
        $("#pet_dating").html(html);

        $(".dating-slider").slick({
            autoplay: false,
            verticalSwiping: false,
            dots: false,
            nextArrow: $("#pet_dating_next"),
            prevArrow: $("#pet_dating_prev"),
        });

        $(".pro_file_icons_like").click(function() {
            $(this).addClass("pro_file_icons_like_active");
        });
    }).error(function(res){
        $("#pet_dating").html('Data not available!');
    })
}


function add_to_adoption() {
    $.ajax({
        url: base_url+'add_to_adoption',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            pet_id: pet_static_account_id,
            user_id: token.id
        }
    }).done(function(res){
        if (res.status == 'Success') {
            myApp.alert(res.api_msg);
        } else {
            myApp.alert(res.api_msg);
        }
    }).error(function(err) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
    });
}

function add_lostfound() {
    if (!$("#lost_found_content").val()) {
        myApp.alert("Please enter description!");
        return false;
    }

    $.ajax({
        url: base_url+'add_to_lostandfound',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            pet_id: pet_static_account_id,
            user_id: token.id,
            description: encodeURI($("#lost_found_content").val()),
        }
    }).done(function(res){
        if (res.status == 'Success') {
            myApp.alert(res.api_msg);
            $("#lost_found_content").val('');
        } else {
            myApp.alert(res.api_msg);
        }
    }).error(function(err) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
    });
}

function remove_lostfound() {
    $.ajax({
        url: base_url+'remove_lostandfound',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            pet_id: pet_static_account_id,
            user_id: token.id
        }
    }).done(function(res){
        if (res.status == 'Success') {
            myApp.alert(res.api_msg);
            $("#lost_found_content").val('');
        } else {
            myApp.alert(res.api_msg);
        }
    }).error(function(err) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
    });
}

function delete_saved(feed_id) { 
    myApp.prompt('This will erase the feed from your saved list, Do you realy want to delete?', function (value) {
        $.ajax({
            url: base_url+'remove_saved_data',
            type: 'POST',
            dataType: 'json',
            crossDomain: true,
            data: {
                feed_id: feed_id,
                user_id: token.id
            }
        }).done(function(res){
            if (res.status == 'Success') {
                myApp.alert(res.api_msg);
                goto_profile();
            } else {
                myApp.alert(res.api_msg);
            }
        }).error(function(err) {
            myApp.hideIndicator();
            myApp.alert('Somthing went wrong, Please try again later!');
        }).always(function(){
        });
    });

}

function delete_feed(feed_id) { 
    myApp.prompt('This will erase the feed from your profile, Do you realy want to delete?', function (value) {
        $.ajax({
            url: base_url+'remove_feed_id',
            type: 'POST',
            dataType: 'json',
            crossDomain: true,
            data: {
                feed_id: feed_id,
                user_id: token.id
            }
        }).done(function(res){
            if (res.status == 'Success') {
                myApp.alert(res.api_msg);
                goto_profile();
            } else {
                myApp.alert(res.api_msg);
            }
        }).error(function(err) {
            myApp.hideIndicator();
            myApp.alert('Somthing went wrong, Please try again later!');
        }).always(function(){
        });
    })
}

function load_friends_profiles(param, calback) {
    $.ajax({
        url: base_url+'get_all_friends_profiles',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: token.id
        }
    }).done(function(res){
        if (res.status == 'Success') {
            var html = '';
            $.each(res.response, function(index, value){
                html += '<option value="'+value.id+'"><img src="'+image_url+value.profile_image+'" style="width: 30px; height: 30px; margin-right: 10px;">'+value.first_name+'</option>';
            })

            $(param).html(html);
        } else {
            myApp.alert(res.api_msg);
        }
    }).error(function(err) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
    });
}

function shareContent() {
    if (!$("#share_with_freinds-freinds").val()) {
        myApp.alert('Please select list of people to share the content!');
        return false;
    }

    myApp.showIndicator();

    $.ajax({
        url: base_url+'shareContent',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: token.id,
            share_user_id: $("#share_with_freinds-freinds").val(),
            sharing_image: sharing_image,
            sharing_content: encodeURI(sharing_content),
            sharing_id: sharing_id, 
            sharing_type: sharing_type, 
        }
    }).done(function(res){
        if (res.status == 'Success') {
            myApp.hideIndicator();
            myApp.alert(res.api_msg);
        } else {
            myApp.hideIndicator();
            myApp.alert(res.api_msg);
        }
    }).error(function(err) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
    });
}


function deletePetFromAdoption(adoption_id) {
    $.ajax({
        url: base_url+'remove_from_adoption',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            adoption_id: adoption_id,
            user_id: token.id,
        }
    }).done(function(res){
        if (res.status == 'Success') {
            myApp.alert(res.api_msg);
            goto_page('become_parent_list.html');
        } else {
            myApp.alert(res.api_msg);
        }
    }).error(function(err) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
    });
}

function addToInterestedList() {
    $.ajax({
        url: base_url+'add_to_intersted_list',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: { pet_id: pet_static_account_id, user_id: token.id, }
    }).done(function(res) {
        if (res.status == 'Success') {
            myApp.alert(res.api_msg);
        } else {
            myApp.alert(res.api_msg);
        }
    }).error(function(err) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
    })
}

function loadNotificationsList() {
    $.ajax({
        url: base_url+'get_notifications',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: { user_id: token.id, }
    }).done(function(res) {
        if (res.status == 'Success') {
            var html = '';

            $.each(res.response, function(index, value) {
                var time = new Date(value.created_date);
                var timechng = time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

                var onClickHtml = '';

                if (value.notification_for == 'Profile') {
                    if (value.related_user_id == token.id) {
                        onClickHtml = 'goto_profile()';
                    } else {
                        onClickHtml = 'goto_user_page('+value.related_user_id+')';
                    }
                } else if (value.notification_for == 'Feed') {
                    onClickHtml = 'load_feed_page('+value.feed_id+')';
                } else if (value.notification_for == 'Become Parent') {
                    onClickHtml = 'goto_becomeParentDetails('+value.feed_id+')';
                } else if (value.notification_for == 'Find Parent') {
                    onClickHtml = 'goto_chat_inner('+value.user_id+')';
                } else if (value.notification_for == 'Business Profile') {
                    onClickHtml = 'goto_business_page('+value.feed_id+')';
                } else if (value.notification_for == 'Pet Profile') {
                    onClickHtml = 'goto_profile_shopper_pet('+value.feed_id+')';
                } else if (value.notification_for == 'Lost and Found') {
                    onClickHtml = 'goto_chat_inner('+value.user_id+')';
                } else if (value.notification_for == 'Mating') {
                    onClickHtml = 'goto_chat_inner('+value.user_id+')';
                } else if (value.notification_for == 'Adoption') {
                    onClickHtml = 'goto_chat_inner('+value.user_id+')';
                } else if (value.notification_for == 'Abuse Feed') {
                    onClickHtml = 'load_abuse_feed_page('+value.feed_id+')';
                }

                html += '<li class="swipeout item-content read_active" onclick="'+onClickHtml+'">'+
                            '<div class="swipeout-content item-content">'+
                                '<div class="item-media pad0">'+
                                    '<img src="'+image_url+value.profile_image+'" width="75" height="75">'+
                                '</div>'+
                                '<div class="item-inner">'+
                                    '<div class="item-title-row">'+
                                        '<div class="item-title"><span onClick="goto_user_page('+value.user_id+');">'+value.first_name+'</span><span class="time-text">'+timechng+'</span>'+
                                        '</div>'+
                                    '</div>'+
                                    '<div class="item-subtitle">'+value.notification_text+'</div>'+
                                '</div>'+
                            '</div>'+
                            // '<div class="swipeout-actions-right">'+
                            //     '<a href="#" class="action1">Mark As Read</a>'+
                            // '</div>'+
                        '</li>';
            })

            $("#notifiactionList").html(html);
        } else {
            $("#notifiactionList").html(res.api_msg);
        }
    }).error(function(err) {
        myApp.hideIndicator();
        myApp.alert('Somthing went wrong, Please try again later!');
    }).always(function(){
    })
}

function forgot_password() {
    if (!$("#forgot_password-email").val()) {
        myApp.alert("Please enter Email!");
        return false;
    }

    if (!$("#forgot_password-password").val()) {
        myApp.alert("Please enter Password!");
        return false;
    }

    if (!$("#forgot_password-cpassword").val()) {
        myApp.alert("Please enter Confirm Password!");
        return false;
    }

    if ($("#forgot_password-password").val() !== $("#forgot_password-cpassword").val()) {
        myApp.alert("Please password mismatch!");
        return false;
    }

    $.ajax({
        url: base_url+ 'update_password',
        type: 'POST',
        crossDomain: true,
        data: { 
            email: $("#forgot_password-email").val(),
            password: $("#forgot_password-password").val(),
        },
    }).done(function(res){
        if (res.status == 'Success') {
            myApp.alert(res.msg);
        } else {
            myApp.alert(res.msg);
        }
    }).error(function(res){
        myApp.alert("Some network error occured, Please try again later!");
    })
}