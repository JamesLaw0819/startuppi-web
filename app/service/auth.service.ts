import {Injectable} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {Subject} from 'rxjs/Subject';
import {BehaviorSubject} from 'rxjs/Rx';
import { Headers, Http } from '@angular/http';
import Globals = require('../globals');
import { User } from '../model/user';


@Injectable()

export class Auth {
    isLoggedIn:boolean;
    logIn$: Subject<boolean> = new BehaviorSubject<boolean>(this.isLoggedIn);
    externalBS;

    redirectUrl: string;

    private signInUrl = Globals.host + '/auth/sign_in';  // URL to web api
    private signUpUrl = Globals.host + '/auth';  // URL to web api

    constructor(private http:Http) {
        this.logIn$.asObservable();
        this.externalBS = this.logIn$;
        if (localStorage.getItem('client')) {
            if (localStorage.getItem('client').length > 0) {
                this.isLoggedIn = true;
            }else{
                this.isLoggedIn = false;
            }
        }else{
            this.isLoggedIn = false;
        }
        
    }


    login(uid:string,client:string,access_token:string) {
        localStorage.setItem('uid',uid);
        localStorage.setItem('client',client);
        localStorage.setItem('access-token',access_token);
        this.isLoggedIn = true;
        this.logIn$.next(this.isLoggedIn);
    }


    logout() {
        localStorage.setItem('uid','');
        localStorage.setItem('client','');
        localStorage.setItem('access-token','');
        this.isLoggedIn = false;   
        this.logIn$.next(this.isLoggedIn);         
    }

    check() {
        return this.externalBS.asObservable().startWith(this.isLoggedIn);
    }

    signIn(email:string,password:string): Promise<User> {
    let creds = JSON.stringify({ email: email, password: password });
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post(this.signInUrl,creds,{headers: headers})
                .toPromise()
                .then(response => this.extractSignInData(response))
                .catch(this.handleError);
    }

    extractSignInData(res){
        console.log(res)
        console.log(res.headers._headersMap.get("uid")[0])
        console.log(res.headers._headersMap.get("client")[0])
        console.log(res.headers._headersMap.get("access-token")[0])
        this.login(res.headers._headersMap.get("uid")[0],res.headers._headersMap.get("client")[0],res.headers._headersMap.get("access-token")[0]);
        let data = res.json().data
        let user:User = new User();
        user.id = data.id;
        user.name = data.name;
        user.email = data.email;
        user.currency = data.currency;
        user.profile_image_url = data.profile_image_url;
        return user;
    }

    signUp(email:string,password:string,name:string,currency:string): Promise<User> {
    let creds = JSON.stringify({ email: email, password: password, password_confirmation:password, confirm_success_url:'localhost', name:name, currency:currency });
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post(this.signUpUrl,creds,{headers: headers})
                .toPromise()
                .then(response => this.extractSignUpData(response))
                .catch(this.handleError);
    }

    extractSignUpData(res){
        console.log(res)
        let data = res.json().data
        let user:User = new User();
        user.id = data.id;
        user.name = data.name;
        user.email = data.email;
        user.currency = data.currency;
        user.profile_image_url = data.profile_image_url;
        user.user_type = data.user_type;
        return user;
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }

}