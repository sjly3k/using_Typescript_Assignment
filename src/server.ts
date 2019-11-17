import * as bodyParser from "body-parser";
import * as express from "express";
import * as exphbs from "express-handlebars";
import * as logger from "morgan";

// Initialize Firebase
import * as firebase from "firebase";

export class Server {

    public app: express.Application;
    public port: number;
    public db: any;

    constructor() {
        this.app = express();
        this.middleware();
        this.config();
        this.fireBase();
    }

    private middleware() {
        this.app
        .use(express.static("views/"))
        .use(logger("dev"))
        .use(bodyParser.json())
        .use(bodyParser.urlencoded({extended: false}))
        .engine("handlebars", exphbs({defaultLayout: "main"}))
        .set("view engine", "handlebars");
    }

    private config(): void {
        this.port = 8000;
    }

    private fireBase() {
        let firebaseConfig = {
            apiKey: "AIzaSyDie6CHWmBNSlGu4yr03Thmx9NsbcD7vBs",
            authDomain: "classum-assignment.firebaseapp.com",
            databaseURL: "https://classum-assignment.firebaseio.com",
            projectId: "classum-assignment",
            storageBucket: "classum-assignment.appspot.com",
            messagingSenderId: "878870176500",
            appId: "1:878870176500:web:fd44e4ee0acd679c3bb4a1"
        };
        firebase.initializeApp(firebaseConfig);
        this.db = firebase.firestore();
    }
}
