import { Server } from "./server";

const server = new Server();

function check_email(email:string){
    return server.db.collection('coupon').where('email', '==', email).get();
}

function GenerateCode() {
    let text : string = '';
    let possible : string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i<16; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function addDays(date:any, days:any) {
    let result : any = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function formatDate(date:any) {
    return date.getFullYear() + '년 ' + 
      (date.getMonth() + 1) + '월 ' + 
      date.getDate() + '일 ' + 
      date.getHours() + '시 ' + 
      date.getMinutes() + '분';
}

server.app.get('/', function(req, res, next) {
    res.render('makecoupon');
}) 

server.app.post('/coupon/generate', function(req, res, next) {

    let email : string = req.body.email;
    check_email(email).then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            if (doc.data().email === email){

                res.json({
                    success : false,
                    message: "This email has already created a coupon."
                })
            
                // res.render('makecoupon', {
                //     error: "This email has already created coupon.",
                //     coupon : doc.data()
                // })
                return;
            }
        });

        if (querySnapshot.empty) {

            let current_date : any = new Date().getTime();
            let creation_date : any = new Date(current_date);
            let end_date : any = addDays(current_date, 3);
            let expired_date : any = new Date(end_date);

            server.db.collection('coupon').add({
                email : email,
                code : GenerateCode(),
                creation_date : formatDate(creation_date),
                expired_date : formatDate(expired_date),
                expired_date_inTimeStamp : end_date,
                used : false
            })

            res.json({
                success : true,
                message: "You can use your coupon!"
            })

            // res.render('makecoupon', {
            //     error: "You can use your coupon !",
            // })
            return;
        }
    });
});

server.app.get('/shop', function(req, res, next) {
    res.render('checkcoupon');
});

server.app.get('/coupon/search', function(req, res, next) {
    res.render('searchcoupon');
})

server.app.post('/coupon/search', function(req, res, next) {
    let email : string = req.body.email;
    check_email(email).then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            if (doc.data().email === email){
                res.json ({
                    success : true,
                    message : 'Your coupon is validate.',
                    email : doc.data().email,
                    code : doc.data().code,
                    creation_date : doc.data().creation_date,
                    expired_date : doc.data().expired_date,
                    used : doc.data().used,
                });

                // res.render('details', {
                //     coupon : JSON.stringify(data),
                // })

            };
        });
        if (querySnapshot.empty) {

            res.json ({
                success : false,
                message : 'There is no coupon made by your email.'
            })

        //     res.render('makecoupon', {
        //         data : JSON.stringify(data),
        //    });
        }
    });
})

server.app.post('/coupon/check', function(req, res, next) {
    let email :string = req.body.email;
    let date : any = new Date().getTime();
    check_email(email).then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            if (doc.data().email === email){
                // console.log(doc.id);
                if (doc.data().expired_date_inTimeStamp.seconds * 1000 < date || doc.data().used === true ) {
                    server.db.collection('coupon').doc(doc.id).update({ used : true });
                    
                    res.json({
                        success : false,
                        message : 'Your Coupon is expired.'
                    })

                    // res.render('makecoupon', {
                    //     error : 'Your Coupon is expired.'
                    // });
                } 
                else {
                    res.render('usecoupon', {
                        coupon : doc.data()
                })
            };  
         };
    });
        if (querySnapshot.empty) {

            res.json({
                success : false,
                message : 'You have to create coupon.'
            })

        //    res.render('makecoupon', {
        //        error : 'You have to create coupon.'
        //    });
        }
    });
});

server.app.post('/coupon/delete/:email', function(req, res, next){
    
    let email : string = req.params.email;

    check_email(email).then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            if (doc.data().email === email){
                server.db.collection('coupon').doc(doc.id).delete();
            };
        });
    });

    res.json({
        success : true,
        message : 'Your code is deleted.'
    })

    // res.redirect('/');
  });

  server.app.listen(server.port, function(){
    console.log('App running on port ' + server.port)
});
