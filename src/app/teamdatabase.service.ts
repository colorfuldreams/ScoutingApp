import { File } from '@ionic-native/file';
import { teamDesc } from './teamdesc';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite'
import { SQLitePorter } from '@ionic-native/sqlite-porter';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/toPromise';
import { Team } from './Team';

@Injectable()
export class DatabaseService {
public js;
    teams: Team[];
    private result: boolean;
    private db: SQLiteObject;
    public ready: boolean = false;
    constructor(private sqlPorter: SQLitePorter, private sqlite: SQLite, private file: File) {
        this.codb().then(() => {

            console.log("Completed Setting Up DB");
            this.ready = true;
        })
    }

    codb() {

        let promise = new Promise((result, reject) => {

            this.sqlite = new SQLite();

            this.sqlite.create({

                name: 'team.db',

                location: 'default'

            }).then((db: SQLiteObject) => {

                this.db = db;

                var sql = 'create table IF NOT EXISTS team (teamid INTEGER PRIMARY KEY AUTOINCREMENT, teamName VARCHAR(255), teamNum int NOT NULL, teamDesc VARCHAR(255) )';

                console.log('Created 1st SQL Statement:' + sql);
 

                db.executeSql(sql, {})

                    .then(() => console.log('Executed 1st SQL Statement'))

                    

                        result();

            })
                .catch(e => console.log(e));

        })

        return promise;

    }


    /* constructor(private sqlite: SQLite, private RealDB: SQLiteObject) {
         this.sqlite.create({
             name: 'data.db',
             location: 'default'
         })
         .then(RealDB => {
             
             
                 RealDB.executeSql('create table customer(id  INTEGER  VARCHAR(32))', {})
                   .then(() => console.log('Executed SQL'))
                   .catch(e => console.log(e));
             
             
               })
               .catch(e => console.log(e));
         
     }*/

    submitData(name: string, id: number, desc: string): Promise<any> {
        /*  this.dbObject.executeSql('INSERT INTO customer(name) VALUES(' + name + ') ', {})
              .then(() => console.log('Executed SQL'))
              .catch(e => console.log(e));*/

        var sucess;
        var sql = "Insert into team (teamName, teamNum, teamDesc) VALUES ('" + name + "',"+id+",'"+desc+"')";
        let promise = new Promise<any>((resolve) => {
            this.db.executeSql(sql, {})
                .then((response) => {
                    console.dir((response));
                    resolve(response);
                     })
                .catch((e) => console.log(e))
        })
        return promise;
        /*
        this.db.executeSql(sql, {})
            .then(() => this.result = true)
            .then((response) => console.log("executed sql" + response))

            .catch(e => console.log('fail: ' + JSON.stringify(e)));*/

        /* this.sqlPorter.importJsonToDb(this.dbObject, name)
             .then(() => { this.result = true})
             .catch(e => console.log(e));*/



    }
    
    /*
    viewAll(): void {
        var r;
        var names = [];
        var sql = 'select * from customer';
        this.db.executeSql(sql, {})
            .then((result) => {
                r = JSON.stringify(result);
                if (result.rows.length > 0) {
                    console.log(result.rows.item(0));

                }
                for (var i = 0; i < result.rows.length; i++) {
                    console.log('RESULT: '+ i + result.rows.item(i).name);
                    names.push(result.rows.item(i).name);
                }
                console.log(result.rows.item(0).name);
                console.log('Rows' + result.rows.length);
            })
            console.log(names); 
            console.log('final: ' + Promise.resolve(this.sqlPorter.exportDbToJson(this.db)).then(function(value) {
                console.log(value);
            }));

            
        } */
    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }

   
    view(): Promise<any> {
        var sql = 'SELECT * from team';
        
        let promise = new Promise((response) => {
            this.db.executeSql(sql, {})
            .then((result) => {
                sleep(2000).then(_ => {
                    this.js = result;

                    console.log(JSON.stringify(result));
                    
                    response(result);
                })

                
               /* if (result.rows.length > 0) {
                    
                    console.log(result.rows.item(0).teamName + result.rows.item(0).teamNum);
                    response(result)
                }
                //this.getData();*/
            })
        })
       
            
            
            return promise;
    }

    getData(): Promise<Team[]> {

        let promise = new Promise<Team[]>((resolve, reject) => {
            this.sqlPorter.exportDbToJson(this.db)
                .then(response => {
                    resolve(response.data.inserts.team as Team[])
                    console.log(response);
                    this.file.writeFile('file:///sdcard/test', 'db.json',JSON.stringify(response), {replace :true}).then(() => console.log("yepdedo"))
                })
                .catch(e => console.error(e))
        })
        return promise;
        /* this.sqlPorter.exportDbToJson(this.db)
             .then(response => {
                 console.log(JSON.stringify(response.data.inserts.team))
                 this.teams = response.data.inserts.team as Team[];
                 console.log(this.teams);
             })
             .catch(this.handleError);
 
         return Promise.resolve(this.teams);*/


    }

    getTeamInfo(id: number): Promise<teamDesc> {
        var response;
        var sql = "Select * from desc WHERE teamid = " + id;
        console.log(sql);
        let promise = new Promise<teamDesc>((resolve, reject) => {
            this.db.executeSql(sql, {})
                .then((result) => {
                    resolve(result.rows.item(0) as teamDesc)
                    console.log("baboomagain" , JSON.stringify(result.rows));
                    
                })
                .catch(e => reject(console.log(e)))
        })


        return promise;
    }

    getTeam(id: number): Promise<Team> {
        var response;
        var sql = "Select * From team where teamid = " + id;
        let promise = new Promise<Team>((resolve, reject) => {
            this.db.executeSql(sql, {})
                .then((result) => {

                    resolve(result.rows.item(0) as Team);
                    console.log("baboom" + JSON.stringify(result.rows));
                })
                .catch(e => reject(console.log(e)))

        })

        return promise;

        /*
            this.db.executeSql(sql, {})
                .then((result) => {
                  response =  JSON.stringify(result);
                  console.log("ii: " + JSON.stringify(result.rows.item(0)));

                })
                .catch(e => console.log(e));

                return response;*/


    }

    export() {
        var x;
        

        let promise = new Promise<JSON>((resolve, reject) => {
                this.sqlPorter.exportDbToJson(this.db)
                    .then(response => resolve(response.data.inserts as JSON))
                    .catch(e => console.error(e))
            })
            return promise;
    }

    start(): boolean {
        return true;
    }
 


}

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }