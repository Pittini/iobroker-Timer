//Script tested & Ok
//Legt Timer an
//Wichtige Einstellungen
const AnzahlTimer = 10; //Wieviele Timer anlegen? Der erste ist 1, nicht 0!
let Presence = getState("radar2.0._nHere").val; //Pfad zum Anwesenheitsdatenpunkt. Erwartet wird eine Zahl >=0

//let setTimeout;
const logging = true; //Logmeldungen an/aus
const praefix = "javascript.0.Timer."; //Grundpfad
var Wochentage = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"]; //Array für createStateschleife zum anlegen der Wochentage
var Astrotrigger = ["dawn", "sunrise", "dusk", "goldenHour", "dusk", "sunset"]; //Array für Astro 
//if (logging) { log(Astrotrigger.length.toString()) };
createState(praefix + "TimerTargets", "", false, { read: true, write: true, name: "Ziele welche geschaltet werden", type: "string", def: "" }); //Zentrale Source für die Anzeige in vis, Erstellung in der TimerRoot
createState(praefix + "TimerTargetNames", "", false, { read: true, write: true, name: "Smartnames für die Ziele", type: "string", def: "" });

for (let x = 1; x < AnzahlTimer + 1; x++) {
    //Datenpunkte anlegen 
    createState(praefix + x + ".Aktiv", false, false, { read: true, write: true, name: "Timer aktiv", type: "boolean", role: "switch", def: false }); //Legt fest ob der Timer aktiv ist
    createState(praefix + x + ".Rolle", 2, false, { read: true, write: true, name: "Rolle", type: "number", role: "value", def: 2 }); //Legt fest ob der Timer für An oder Aus zuständig ist
    createState(praefix + x + ".TimerTimestamp", "00:00:00", false, { read: true, write: true, name: "Zeitstempel für schaltzeit", type: "string", def: "00:00:00" });
    createState(praefix + x + ".TimerAstroTimestamp", "00:00:00", false, { read: true, write: true, name: "Zeitstempel für Astroschaltzeit", type: "string", def: "00:00:00" });
    createState(praefix + x + ".TimerAstroShift", 0, false, { read: true, write: true, name: "Zeitverschiebung für Astroschaltzeit", type: "number", def: 0 });
    for (let y = 0; y < 7; y++) { //Einträge für jeden Wochentag anlegen
        createState(praefix + x + ".Timer" + Wochentage[y], true, false, { read: true, write: true, name: Wochentage[y], type: "boolean", role: "switch", def: true });
    };
    createState(praefix + x + ".TimerChoice", "Zeit", false, { read: true, write: true, name: "Funktionswahl für Timer/Astro", type: "string", def: "Zeit" }); //Gewählte Funktion, Timer oder Astro
    createState(praefix + x + ".SwitchTarget", "", false, { read: true, write: true, name: "Ziel für Schaltvorgang", type: "string", def: "" });
    createState(praefix + x + ".OnlyIfPresence", false, false, { read: true, write: true, name: "Nur ausführen falls jemand anwesend", type: "boolean", role: "switch", def: false }); //Legt fest ob der Timer aktiv ist
    createState(praefix + x + ".OnlyIfNoPresence", false, false, { read: true, write: true, name: "Nur ausführen falls niemand anwesend", type: "boolean", role: "switch", def: false }); //Legt fest ob der Timer aktiv ist
};


//****************************

//Datenpunkte Id"s zuweisen
var id1 = [];
for (let x = 1; x < AnzahlTimer + 1; x++) {//Anzahl der Timer
    let y = 0;
    id1[x] = [];
    id1[x][y] = (praefix + x + ".Aktiv"); y = y + 1;
    id1[x][y] = (praefix + x + ".Rolle"); y = y + 1;
    id1[x][y] = (praefix + x + ".TimerTimestamp"); y = y + 1;
    id1[x][y] = (praefix + x + ".TimerAstroTimestamp"); y = y + 1;
    id1[x][y] = (praefix + x + ".TimerAstroShift"); y = y + 1;
    id1[x][y] = (praefix + x + ".TimerChoice"); y = y + 1;
    for (let z = 0; z < Wochentage.length; z++) {//Schleifenvariable für Wochentage
        id1[x][y] = (praefix + x + ".Timer" + Wochentage[z]); y = y + 1;
    };
    id1[x][y] = (praefix + x + ".SwitchTarget"); y = y + 1;
    id1[x][y] = (praefix + x + ".OnlyIfPresence"); y = y + 1;
    id1[x][y] = (praefix + x + ".OnlyIfNoPresence"); y = y + 1;

};

// TimerVariablenArray anlegen für schedules
var TimerAction = [];
for (let x = 1; x < AnzahlTimer + 1; x++) {
    TimerAction[x] = null;
};

//Alle Daten in MyTimer Array einlesen
var MyTimer = [];
for (let x = 1; x < AnzahlTimer + 1; x++) {
    MyTimer[x] = [];
    for (let y = 0; y < id1[x].length; y++) {
        //log("x=" + x + "  y=" + y);
        MyTimer[x][y] = getState(id1[x][y]).val;
        //log(MyTimer[x][y]);
    };
};

//******************************************************** */

function MakeCronString(whichone) { //String nach Cronsyntax zusammenbauen für Schedule

    var DaysSubString = "";
    for (let x = 0; x < 7; x++) {
        if (MyTimer[whichone][x + 6] == true) { //Beginnend mit dem 6ten Eintrag (TimerSonntag) die 7 Wochentage durchzählen und Werte anhängen
            DaysSubString = DaysSubString + x + ",";
        };
    };
    DaysSubString = DaysSubString.substr(0, DaysSubString.length - 1); //Komma am Ende entfernen
    if (DaysSubString == "0,1,2,3,4,5,6") { DaysSubString = "*"; }; // Sternchen wenn alle Tage gewählt

    var tempString = "";
    if (MyTimer[whichone][5] == "Zeit") { //Wenn Zeit gewählt
        tempString = SplitTime(MyTimer[whichone][2])[1] + " " + SplitTime(MyTimer[whichone][2])[0] + " * * " + DaysSubString;
        //log("CronString für Timer " + whichone + " erstellt " + tempString);
    }
    else if (MyTimer[whichone][5] != "Zeit") { //Wenn Astro gewählt
        tempString = SplitTime(MyTimer[whichone][3])[1] + " " + SplitTime(MyTimer[whichone][3])[0] + " * * " + DaysSubString;
        //log("Cronstring für Timer " + whichone + " Astro erstellt " + tempString);
    };
    return tempString;
};

//spezifischen Timer setzen
function SetTimer(whichone) {
    if (MyTimer[whichone][0] == true) {
        //log("Timer " + whichone + " wird gesetzt")
        TimerAction[whichone] = schedule(MakeCronString(whichone), function () {
            DoAction(whichone);
            if (MyTimer[whichone][5] != "Zeit") { //Wenn Astro gewählt
                RefreshAstro(whichone); //Neue Astrozeit setzen nach Ausführung
            }
        });
    };
};

function RefreshAstro(whichone) {
    if (logging) { log("Refresh Astro") };
    SetChoosenAstroTime(whichone, true);
    SetTimer(whichone);
};

//Alle Timer setzen
function SetAllTimer() {
    if (logging) { log("Setting all Timers") };
    for (let x = 1; x < AnzahlTimer + 1; x++) {
        SetTimer(x);
    }
};

//spezifischen Timer löschen
function KillTimer(whichone) {
    clearSchedule(TimerAction[whichone]);
    if (logging) { log("Timer " + whichone + " killed") };
}

//Astro oder Zeit Gateway
function AstroOrTime(whichone) {
    if (MyTimer[whichone][5] == "Zeit") {
        if (logging) { log("Zeit gewählt " + MyTimer[whichone][2]) };
    }
    else if (MyTimer[whichone][5] != "Zeit") {
        SetChoosenAstroTime(whichone);
        log("Astro gewählt, Variante " + MyTimer[whichone][5]);
    };
};

function SetChoosenAstroTime(whichone, GoToTomorrow) { //Zeit für gewählte Astrozeit eintragen
    let Shift = parseInt(MyTimer[whichone][4]); //Wert für Shift
    let AstroChoice = MyTimer[whichone][5].trim(); //Wert für Astroereignis

    //Berücksichtigen ob Event schon vorbei ist und dann für morgen setzen
    let today = new Date();
    let jetzt = new Date();
    let tomorrow = today.setDate(today.getDate() + 1);
    let tomorrowAstroTime = getAstroDate(AstroChoice, tomorrow);
    tomorrowAstroTime.setMinutes(tomorrowAstroTime.getMinutes() + Shift);//zammrechna
    //log(AstroChoice + " beginnt heute um:" + getAstroDate(AstroChoice).toLocaleTimeString('de-DE', { hour12: false }) + " und beginnt morgen um " + tomorrowAstroTime.toLocaleTimeString('de-DE', { hour12: false }));
    //log(getAstroDate(AstroChoice).getTime() + " " + today.getTime() + " " + today.toLocaleTimeString());
    //log("Astro=" + getAstroDate(AstroChoice) + " Heute=" + jetzt + " " + "todayzeit=" + today.toLocaleTimeString());

    let AstroTime = getAstroDate(AstroChoice); //Astrotime einlesen
    AstroTime.setMinutes(AstroTime.getMinutes() + Shift);//zammrechna
    AstroTime.toLocaleTimeString('de-DE', { hour12: false });
    //if (getAstroDate(AstroChoice).getTime()  < jetzt.getTime()) { //Wenn Astrozeit vor aktueller Zeit dann Astrozeit von morgen verwenden
    if (AstroTime.getTime() <= jetzt.getTime() || GoToTomorrow == true) { //Wenn Astrozeit vor aktueller Zeit dann Astrozeit von morgen verwenden
        setState(id1[whichone][3], tomorrowAstroTime.toLocaleTimeString('de-DE', { hour12: false }));
        MyTimer[whichone][3] = tomorrowAstroTime.toLocaleTimeString('de-DE', { hour12: false });
        //log("Astrotime von morgen verwendet, Event is heute bereits vorüber = " + tomorrowAstroTime.toLocaleTimeString('de-DE', { hour12: false }));
    }
    //else if (getAstroDate(AstroChoice).getTime() > jetzt.getTime()) {
    else if (AstroTime.getTime() > jetzt.getTime()) {
        setState(id1[whichone][3], AstroTime.toLocaleTimeString('de-DE', { hour12: false }));
        MyTimer[whichone][3] = AstroTime.toLocaleTimeString('de-DE', { hour12: false });
        //log("Astrotime von heute verwendet, Event kommt heute noch = " + AstroTime.toLocaleTimeString('de-DE', { hour12: false }) + " Morgen=" + tomorrowAstroTime.toLocaleTimeString('de-DE', { hour12: false }));
    }
    else {
        //log("Derf ned sei");
    };
};

function DoAction(whichone) {
    if (MyTimer[whichone][0] == true) { //Wenn Timer aktiv
        if ((MyTimer[whichone][14] == true && Presence !=0) || (MyTimer[whichone][13] == true && Presence == 0) || (MyTimer[whichone][13] == true && MyTimer[whichone][14] == true)) { //Wenn "bei Anwesenheit" aktiv

            if (MyTimer[whichone][1] == 1) { // Wenn die Rolle Anschalter ist
                setState(MyTimer[whichone][13], true); //Switchtarget aktivieren
                log(MyTimer[whichone][13] + " Timer " + whichone + " hat angeschaltet");
            }
            else if (MyTimer[whichone][1] == 0) { //Wenns die Rolle Ausschalter ist
                setState(MyTimer[whichone][13], false);//Switchtarget deaktivieren
                log("Timer " + whichone + " hat ausgeschaltet");
            };
        };
    };
};


//if (logging) { log(SplitTime("12:05") + h + m) };
//Zeit in Stunden und Minuten teilen für Cronstring
function SplitTime(Time) {
    var timesplit = Time.split(":", 2);
    //h = timesplit[0]  / m = timesplit[1];
    return timesplit;
};

function main() {
    SetAllTimer();
};

main();

//Trigger für Timer x
onStop(function () { //Bei Scriptende alle Timer löschen
    for (let x = 1; x < AnzahlTimer + 1; x++) {
        KillTimer(x);
    };
}, 100);

for (let x = 1; x < AnzahlTimer + 1; x++) { //Alle Timer durchlaufen und Trigger setzen
    on(id1[x][5], function (dp) { //Bei Änderung AstroChoice
        MyTimer[x][5] = getState(id1[x][5]).val; //Nach Änderung neuen Wert einlesen
        KillTimer(x);
        AstroOrTime(x);
        SetTimer(x);
        if (logging) log("AstroChoice geändert" + " für Timer " + x);
    });

    on(id1[x][1], function (dp) { //Bei Änderung Rolle
        MyTimer[x][1] = getState(id1[x][1]).val; //Nach Änderung neuen Wert einlesen
        if (MyTimer[x][1] == 2) {//Wenn TimerRolle=2 =inaktiv
            MyTimer[x][0] = false;
            setState(id1[x][0], false);
        }
        else {
            MyTimer[x][0] = true;
            setState(id1[x][0], true);
        };
        KillTimer(x);
        SetTimer(x);
        if (logging) log("Rolle geändert" + " für Timer " + x);
    });

    on(id1[x][4], function (dp) { //Bei Änderung Shift
        MyTimer[x][4] = getState(id1[x][4]).val; //Nach Änderung neuen Wert einlesen
        KillTimer(x);
        AstroOrTime(x);
        SetTimer(x);
        if (logging) log("Shift geändert" + " für Timer " + x);
    });

    on(id1[x][2], function (dp) { //Bei Änderung Zeit (TimerTimestamp)
        //setTimeout(function () { //1sek Timeout um prellen zu vermeiden
        MyTimer[x][2] = getState(id1[x][2]).val; //Nach Änderung neuen Wert einlesen
        KillTimer(x);
        SetTimer(x);
        if (logging) log("TimerTimestamp Zeit geändert auf " + MyTimer[x][2] + " für Timer " + x);
        //}, 1000);
    });

    on(id1[x][0], function (dp) { //Bei Änderung Timer Aktiv
        MyTimer[x][0] = getState(id1[x][0]).val; //Nach Änderung neuen Wert einlesen
        if (logging) log("TimerActive geändert auf " + MyTimer[x][0] + " für Timer " + x);
        //KillTimer(x);
        //SetTimer(x);

    });

    on(id1[x][6], function (dp) { //Bei Änderung Wochentage
        MyTimer[x][6] = getState(id1[x][6]).val; //Nach Änderung neuen Wert einlesen
        KillTimer(x);
        SetTimer(x);

        if (logging) log("TimerTag " + Wochentage[0] + " geändert auf " + MyTimer[x][6] + " für Timer " + x);
    });
    on(id1[x][7], function (dp) { //Bei Änderung Wochentage
        MyTimer[x][7] = getState(id1[x][7]).val; //Nach Änderung neuen Wert einlesen
        KillTimer(x);
        SetTimer(x);

        if (logging) log("TimerTag " + Wochentage[1] + " geändert auf " + MyTimer[x][7] + " für Timer " + x);
    });
    on(id1[x][8], function (dp) { //Bei Änderung Wochentage
        MyTimer[x][8] = getState(id1[x][8]).val; //Nach Änderung neuen Wert einlesen
        KillTimer(x);
        SetTimer(x);

        if (logging) log("TimerTag " + Wochentage[2] + " geändert auf " + MyTimer[1][8] + " für Timer " + x);
    });
    on(id1[x][9], function (dp) { //Bei Änderung Wochentage
        MyTimer[x][9] = getState(id1[x][9]).val; //Nach Änderung neuen Wert einlesen
        KillTimer(x);
        SetTimer(x);

        if (logging) log("TimerTag " + Wochentage[3] + " geändert auf " + MyTimer[x][9] + " für Timer " + x);
    });
    on(id1[x][10], function (dp) { //Bei Änderung Wochentage
        MyTimer[x][10] = getState(id1[x][10]).val; //Nach Änderung neuen Wert einlesen
        KillTimer(x);
        SetTimer(x);

        if (logging) log("TimerTag " + Wochentage[4] + " geändert auf " + MyTimer[x][10] + " für Timer " + x);
    });
    on(id1[x][11], function (dp) { //Bei Änderung Wochentage
        MyTimer[x][11] = getState(id1[x][6]).val; //Nach Änderung neuen Wert einlesen
        KillTimer(x);
        SetTimer(x);

        if (logging) log("TimerTag " + Wochentage[5] + " geändert auf " + MyTimer[x][11] + " für Timer " + x);
    });
    on(id1[x][12], function (dp) { //Bei Änderung Wochentage
        MyTimer[x][12] = getState(id1[x][12]).val; //Nach Änderung neuen Wert einlesen
        KillTimer(x);
        SetTimer(x);

        if (logging) log("TimerTag " + Wochentage[6] + " geändert auf " + MyTimer[x][12] + " für Timer " + x);
    });
    on(id1[x][12], function (dp) { //Bei Änderung Switchtarget
        MyTimer[x][13] = getState(id1[x][13]).val; //Nach Änderung neuen Wert einlesen
        if (logging) log("TimerTag " + Wochentage[6] + " geändert auf " + MyTimer[x][12] + " für Timer " + x);
    });

};



