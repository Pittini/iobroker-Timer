//V 2.0.1 Stand 22.5.2020 - In Progress - Github: https://github.com/Pittini/iobroker-Timer Forum: https://forum.iobroker.net/topic/33228/vorlage-flexibles-timerskript-vis

//Legt Timer an

//Wichtige Einstellungen
const logging = true; //Logmeldungen an/aus
const praefix = "javascript.0.Timer."; //Grundpfad
const PresenceDp = "radar2.0._nHere"; //Pfad zum Anwesenheitsdatenpunkt - Leer lassen wenn nicht vorhanden

const WelcheFunktionVerwenden = "TimerTarget";

const UseTelegram = false; // Sollen Nachrichten via Telegram gesendet werden?
const UseAlexa = false; // Sollen Nachrichten via Alexa ausgegeben werden?
const AlexaId = ""; // Die Alexa Seriennummer.
const UseMail = false; //Nachricht via Mail versenden?
const UseSay = true; // Sollen Nachrichten via Say ausgegeben werden? Autorenfunktion, muß deaktiviert werden.
const UseEventLog = false; // Sollen Nachrichten ins Eventlog geschreiben werden? Autorenfunktion, muß deaktiviert werden.
//Tabellen Einstellungen
//Bearbeite - Aktiv - Aktion - Mode - Zeit - Offset - Ziel - Tage - wenn anwesend - wenn abwesend

const TblOnBgColor = "#4caf50"; //Hintergrundfarbe für Timer hat angeschaltet
const TblOffBgColor = "#f44336"; //Hintergrundfarbe für Timer hat ausgeschaltet
const TblIdleBgColor = "black"; //Hintergrundfarbe für Timer ist inaktiv
const TblEditBgColor = "#ffc107"; //Hintergrundfarbe für Timer welcher gerade bearbeitet wird
const TblChoosenColor = "white"; //Rahmenfarbe für gewählten Timer, noch nicht im Edit Mode
const HeadBgColor = "dimgrey"; //Hintergrundfarbe des Tabellenkopfes
const FontColor = "white"; //Textfarbe für Tabelleninhalt
const HeadFontColor = "white"; //Textfarbe für Tabellenkopf
const TblShowTimerLfdCol = true; //Tabellenspalte mit laufender Nummer anzeigen?
const TblShowTimerActiveCol = true; //Tabellenspalte ob Timer aktiv anzeigen?
const TblShowTimerActionCol = true; //Tabellenspalte mit Timer Aktion anzeigen?
const TblShowTimerModeCol = true; //Tabellenspalte mit Timermodus anzeigen?
const TblShowTimerTimeCol = true; //Tabellenspalte mit Schaltzeit anzeigen? 
const TblShowTimerAstroOffsetCol = true; //Tabellenspalte mit Astro Offset anzeigen?
const TblShowTimerTargetCol = true; //Tabellenspalte mit Timer Ziel anzeigen?
const TblShowTimerTargetNameCol = true; //Tabellenspalte mit Namen des Timer Ziels anzeigen?
const TblShowTimerDaysCol = true; //Tabellenspalte mit aktiven Tagen anzeigen?
const TblShowTimerIfPresenceCol = true; //Tabellenspalte Schaltung nur bei Anwesenheit ausgeben?
const TblShowTimerIfNoPresenceCol = true; //Tabellenspalte Schaltung nur bei Abwesenheit ausgeben?
const ImgInvert = 0; // Bildfarben invertieren? Erlaubte Werte von 0 bis 1
const TblLfdImg = "/icons-mfd-svg/time_timer.svg"; //Bild für "Timer aktiv"
const TblActiveImg = "/icons-mfd-svg/control_on_off.svg"; //Bild für "Timer aktiv"
const TblIfPresenceImg = "/icons-mfd-svg/status_available.svg"; //Bild für "Nur wenn anwesend"
const TblIfNoPresenceImg = "/icons-mfd-svg/control_building_empty.svg"; //Bild für "Nur wenn abwesend"

//Ab hier nix mehr ändern
let TimerCount = 2; //Wieviele Timer bei SkriptERSTstart anlegen?
let MsgMute = false;
let Funktionen = getEnums('functions'); //Array mit Aufzählung der Funktionen
const Targets = [];

const Wochentage = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"]; //Array für createStateschleife zum anlegen der Wochentage
const ModeValues = ["time", "dawn", "sunrise", "goldenHour", "sunset", "dusk"]; //Array für Astrobezeichnungen 
const ModeText = ["Zeit", "Morgendämmerung", "Sonnenaufgang", "Goldene Stunde", "Sonnenuntergang", "Abenddämmerung"]; //Array für Astrobezeichnungen  in Deutsch
const AktionValues = [0, 1, 2];
const AktionText = ["Ausschalten", "Einschalten", "Umschalten"];
const Dps = ["Aktiv", "Rolle", "TimerTimestamp", "TimerAstroTimestamp", "TimerAstroShift", "TimerChoice", "TimerSonntag", "TimerMontag", "TimerDienstag", "TimerMittwoch", "TimerDonnerstag", "TimerFreitag", "TimerSamstag", "SwitchTarget", "OnlyIfPresence", "OnlyIfNoPresence"];

//const TimerAction = []; //Objektarray für Schedules
let MyTimer = []; //Datenarray aller Timer

let Presence = true; //Voreinstellung Anwesenheit ist wahr, für den Fall das kein PresenceDp angegeben
let DpCount = 0; //Counter

let SwitchingInProgress = false; //Steuervariable um ungewolltes Triggern (und aktivieren des Edit Modes) während Template-umschaltung zu vermeiden
let DeletionInProgress = false;
let ChoosenTimer = 0; //Aktuell (in Vis) gewählter Timer


PrepareDps(); //Datenpunkte Initial erstellen

function Meldung(msg) {
    if (logging) log("Reaching Meldung, msg= " + msg);

    if (!MsgMute) {
        if (UseSay) Say(msg);

        if (UseAlexa) {
            if (AlexaId != "") setState("alexa2.0.Echo-Devices." + AlexaId + ".Commands.announcement"/*announcement*/, msg);
        };

        if (UseEventLog) {
            WriteEventLog(msg);
        };

        if (UseTelegram) {
            sendTo("telegram.0", "send", {
                text: msg
            });
        };

        if (UseMail) {
            sendTo("email", {
                html: msg
            });
        };
    };
}

function PrepareDps() {
    const States = []; //

    //Dps für ValueLists
    States[DpCount] = { id: praefix + "TimerTargetValues", initial: "", forceCreation: false, common: { read: true, write: false, name: "Ziele welche geschaltet werden", type: "string", def: "" } }; //Zentrale Source für die Anzeige in vis, Erstellung in der TimerRoot
    DpCount++;
    States[DpCount] = { id: praefix + "TimerTargetText", initial: "", forceCreation: false, common: { read: true, write: false, name: "Smartnames für die Ziele", type: "string", def: "" } };
    DpCount++;
    States[DpCount] = { id: praefix + "ModeValues", initial: "", forceCreation: false, common: { read: true, write: false, name: "Werte für ModeListenfeld", type: "string", def: "" } };
    DpCount++;
    States[DpCount] = { id: praefix + "ModeText", initial: "", forceCreation: false, common: { read: true, write: false, name: "Bezeichnungen für ModeListenfeld", type: "string", def: "" } };
    DpCount++;
    States[DpCount] = { id: praefix + "AktionValues", initial: "", forceCreation: false, common: { read: true, write: false, name: "Werte für AktionListenfeld", type: "string", def: "" } };
    DpCount++;
    States[DpCount] = { id: praefix + "AktionText", initial: "", forceCreation: false, common: { read: true, write: false, name: "Bezeichnungen für AktionListenfeld", type: "string", def: "" } };
    DpCount++;
    States[DpCount] = { id: praefix + "TimerCountValues", initial: "", forceCreation: false, common: { read: true, write: false, name: "Werte für TimerCountListenfeld?", type: "string", def: "" } };
    DpCount++;
    States[DpCount] = { id: praefix + "TimerCountText", initial: "", forceCreation: false, common: { read: true, write: false, name: "Bezeichnungen für TimerCountListenfeld", type: "string", def: "" } };
    DpCount++;

    //Diverse Root Dps
    States[DpCount] = { id: praefix + "TimerOverviewTable", initial: "", forceCreation: false, common: { read: true, write: false, name: "HTML Übersichtstabelle aller Timer", type: "string", def: "" } };
    DpCount++;
    States[DpCount] = { id: praefix + "SwitchToTimer", initial: 0, forceCreation: false, common: { read: true, write: true, name: "Welchen Timer anzeigen/bearbeiten?", type: "number", def: 0 } };
    DpCount++;
    States[DpCount] = { id: praefix + "SaveEdit", initial: false, forceCreation: false, common: { read: true, write: true, name: "Einstellungen speichern", type: "boolean", def: false } };
    DpCount++;
    States[DpCount] = { id: praefix + "AddTimer", initial: false, forceCreation: false, common: { read: true, write: true, name: "Timer hinzufügen", type: "boolean", def: false } };
    DpCount++;
    States[DpCount] = { id: praefix + "DelTimerSecCheck", initial: false, forceCreation: false, common: { read: true, write: true, name: "Sicherheitsabfrage Timer löschen", type: "boolean", def: false } };
    DpCount++;
    States[DpCount] = { id: praefix + "DelTimer", initial: false, forceCreation: false, common: { read: true, write: true, name: "Timer löschen", type: "boolean", def: false } };
    DpCount++;
    States[DpCount] = { id: praefix + "TimerCount", initial: TimerCount, forceCreation: false, common: { read: true, write: true, name: "Anzahl der Timer", type: "number", def: TimerCount } };
    DpCount++;
    States[DpCount] = { id: praefix + "PresenceFuncAvailable", initial: false, forceCreation: false, common: { read: true, write: false, name: "Anwesenheitsdatenpunkt vorhanden?", type: "boolean", def: false } };
    DpCount++;
    States[DpCount] = { id: praefix + "MsgMute", initial: false, forceCreation: false, common: { read: true, write: true, name: "Meldungen stummschalten?", type: "boolean", def: false } };
    DpCount++;

    //Template Dps
    States[DpCount] = { id: praefix + "Template", initial: "", forceCreation: false, common: { read: true, write: true, name: "Template für Vis", type: "channel", def: "" } };
    DpCount++;
    States[DpCount] = { id: praefix + "Template" + ".Aktiv", initial: false, forceCreation: false, common: { read: true, write: true, name: "Timer aktiv", type: "boolean", role: "switch", def: false } }; //Legt fest ob der Timer aktiv ist
    DpCount++;
    States[DpCount] = { id: praefix + "Template" + ".Rolle", initial: 1, forceCreation: false, common: { read: true, write: true, name: "Rolle", type: "number", role: "value", def: 1 } }; //Legt fest ob der Timer für An oder Aus zuständig ist
    DpCount++;
    States[DpCount] = { id: praefix + "Template" + ".TimerTimestamp", initial: "00:00:00", forceCreation: false, common: { read: true, write: true, name: "Zeitstempel für schaltzeit", type: "string", def: "00:00:00" } };
    DpCount++;
    States[DpCount] = { id: praefix + "Template" + ".TimerAstroTimestamp", initial: "00:00:00", forceCreation: false, common: { read: true, write: true, name: "Zeitstempel für Astroschaltzeit", type: "string", def: "00:00:00" } };
    DpCount++;
    States[DpCount] = { id: praefix + "Template" + ".TimerAstroShift", initial: 0, forceCreation: false, common: { read: true, write: true, name: "Zeitverschiebung für Astroschaltzeit", type: "number", def: 0 } };
    DpCount++;
    for (let y = 0; y < 7; y++) { //Einträge für jeden Wochentag anlegen
        States[DpCount] = { id: praefix + "Template" + ".Timer" + Wochentage[y], initial: true, forceCreation: false, common: { read: true, write: true, name: Wochentage[y], type: "boolean", role: "switch", def: true } };
        DpCount++;
    };
    States[DpCount] = { id: praefix + "Template" + ".TimerChoice", initial: ModeValues[0], forceCreation: false, common: { read: true, write: true, name: "Funktionswahl für Timer/Astro", type: "string", def: ModeValues[0] } }; //Gewählte Funktion, Timer oder Astro
    DpCount++;
    States[DpCount] = { id: praefix + "Template" + ".SwitchTarget", initial: "", forceCreation: false, common: { read: true, write: true, name: "Ziel für Schaltvorgang", type: "string", def: "" } };
    DpCount++;
    States[DpCount] = { id: praefix + "Template" + ".OnlyIfPresence", initial: true, forceCreation: false, common: { read: true, write: true, name: "Nur ausführen falls jemand anwesend", type: "boolean", role: "switch", def: true } }; //Legt fest ob der Timer aktiv ist
    DpCount++;
    States[DpCount] = { id: praefix + "Template" + ".OnlyIfNoPresence", initial: true, forceCreation: false, common: { read: true, write: true, name: "Nur ausführen falls niemand anwesend", type: "boolean", role: "switch", def: true } }; //Legt fest ob der Timer aktiv ist
    DpCount++;

    //Alle States anlegen, Main aufrufen wenn fertig
    let numStates = States.length;
    States.forEach(function (state) {
        createState(state.id, state.initial, state.forceCreation, state.common, function () {
            numStates--;
            if (numStates === 0) {
                if (logging) log("Initial CreateStates fertig!");
                main();
            };
        });
    });
}

function CreateTimer(x) { //Erzeugt Timerchannel und Dps. Aufruf bei Start und AddTimer
    //if (logging) log("Reaching CreateTimer, x=" + x)

    let States = [];
    DpCount = 0;
    //Datenpunkte anlegen 
    States[DpCount] = { id: praefix + x, initial: "", forceCreation: false, common: { read: true, write: true, name: "Timer" + x, type: "channel", def: "" } }; //Channel anlegen
    DpCount++;
    States[DpCount] = { id: praefix + x + ".Aktiv", initial: false, forceCreation: false, common: { read: true, write: true, name: "Timer aktiv", type: "boolean", role: "switch", def: false } }; //Legt fest ob der Timer aktiv ist
    DpCount++;
    States[DpCount] = { id: praefix + x + ".Rolle", initial: 1, forceCreation: false, common: { read: true, write: false, name: "Rolle", type: "number", role: "value", def: 1 } }; //Legt fest ob der Timer für An oder Aus zuständig ist
    DpCount++;
    States[DpCount] = { id: praefix + x + ".TimerTimestamp", initial: "00:00:00", forceCreation: false, common: { read: true, write: false, name: "Zeitstempel für schaltzeit", type: "string", def: "00:00:00" } };
    DpCount++;
    States[DpCount] = { id: praefix + x + ".TimerAstroTimestamp", initial: "00:00:00", forceCreation: false, common: { read: true, write: false, name: "Zeitstempel für Astroschaltzeit", type: "string", def: "00:00:00" } };
    DpCount++;
    States[DpCount] = { id: praefix + x + ".TimerAstroShift", initial: 0, forceCreation: false, common: { read: true, write: false, name: "Zeitverschiebung für Astroschaltzeit", type: "number", def: 0 } };
    DpCount++;
    for (let y = 0; y < 7; y++) { //Einträge für jeden Wochentag anlegen
        States[DpCount] = { id: praefix + x + ".Timer" + Wochentage[y], initial: true, forceCreation: false, common: { read: true, write: false, name: Wochentage[y], type: "boolean", role: "switch", def: true } };
        DpCount++;
    };
    States[DpCount] = { id: praefix + x + ".TimerChoice", initial: ModeValues[0], forceCreation: false, common: { read: true, write: false, name: "Funktionswahl für Timer/Astro", type: "string", def: ModeValues[0] } }; //Gewählte Funktion, Timer oder Astro
    DpCount++;
    States[DpCount] = { id: praefix + x + ".SwitchTarget", initial: "", forceCreation: false, common: { read: true, write: false, name: "Ziel für Schaltvorgang", type: "string", def: "" } };
    DpCount++;
    States[DpCount] = { id: praefix + x + ".OnlyIfPresence", initial: true, forceCreation: false, common: { read: true, write: false, name: "Nur ausführen falls jemand anwesend", type: "boolean", role: "switch", def: true } }; //Legt fest ob der Timer aktiv ist
    DpCount++;
    States[DpCount] = { id: praefix + x + ".OnlyIfNoPresence", initial: true, forceCreation: false, common: { read: true, write: false, name: "Nur ausführen falls niemand anwesend", type: "boolean", role: "switch", def: true } }; //Legt fest ob der Timer aktiv ist
    DpCount++;

    //Alle States anlegen,  aufrufen wenn fertig
    let numStates = States.length;
    States.forEach(function (state) {
        createState(state.id, state.initial, state.forceCreation, state.common, function () {
            numStates--;
            if (numStates === 0) { //Sicherstellen das alle Dps erzeugt wurden bevor eingelesen wird
                if (logging) log("Timer CreateState(s) fertig!");
                FillTimerArray(x);
            };
        });
    });
}

function FillTimerArray(x) { //Erzeugt TimerArray. Aufruf bei Start und AddTimer
    //if (logging) log("Reaching FillTimerArray, x=" + x)
    MyTimer[x] = [];
    for (let y = 0; y < Dps.length; y++) {
        //log(praefix + x + "." + Dps[y]);
        MyTimer[x][y] = getState(praefix + x + "." + Dps[y]).val;
        if (y == 4) MyTimer[x][y] = parseInt(MyTimer[x][y]); //Sicherstellen das Offset Zahl ist
        //log("y=" + y + "Wert=" + MyTimer[x][y]);
    };
    if (MyTimer[x][0] == false) {
        MyTimer[x].push("idle"); //Zusätzlichen internen Eintrag [16] für Tabellenstatus anhängen - Idle wenn Timer inaktiv
    }
    else {
        MyTimer[x].push(""); //Leer wenn Timer aktiv
    };

    MyTimer[x].push(false); //Weiteren Status [17] für IsEdit anhängen

    if (MyTimer[x][13] == "") { //Wenn Target leer
        MyTimer[x].push(""); //Zusätzlichen internen Eintrag [18] für Aktuellen Device Status anhängen
    } else {
        MyTimer[x].push(getState(MyTimer[x][13]).val);//Zusätzlichen internen Eintrag [18] für Aktuellen Device Status anhängen
    };

    MyTimer[x].push(null); //Weiteren Status [19] für TimerAction (TimerobjektArray für Schedule) anhängen

    CreateDeviceTrigger(x); //DeviceTrigger für diesen Timereintrag erstellen
    SetTimer(x); //Timer setzen

    if (x == TimerCount - 1) { //Erst bei letztem Eintrag Tabelle refreshen (bei Skriptstart relevant)
        MakeTable();
    };
}

function ConvertPresence(TempPresence = true) {//Wert vom Anwesenheitsdatenpunkt konvertieren falls Nummer, true als default. 
    if (logging) log("Reaching ConvertPresence. TempPresence=" + TempPresence)
    if (PresenceDp != "") {
        setState(praefix + "PresenceFuncAvailable", true);  //Anwesenheitsfunktion vorhanden Datenpunkt aktivieren um Buttons in Vis anzuzeigen
        TempPresence = getState(PresenceDp).val;
        switch (typeof (TempPresence)) {
            case "number":
                if (TempPresence == 0) Presence = false;
                break;
            case "boolean":
                Presence = TempPresence;
                break;
        };
    } else {
        setState(praefix + "PresenceFuncAvailable", false);//Anwesenheitsfunktion vorhanden Datenpunkt deaktivieren um Buttons in Vis anzuzeigen
    };
}

function CreateTimerCountList() {
    if (logging) log("Reaching CreateTimerCountList()")

    //Timerauswahl ValueList
    let ValueDummy = "";
    let ValueTextDummy = "";

    for (let x = 0; x < TimerCount; x++) {
        ValueDummy += x + ";";
        ValueTextDummy += (x + 1) + ";";
    };

    ValueDummy = ValueDummy.substr(0, ValueDummy.length - 1);
    ValueTextDummy = ValueTextDummy.substr(0, ValueTextDummy.length - 1);

    //Timer ValueList
    setState(praefix + "TimerCountValues", ValueDummy);
    setState(praefix + "TimerCountText", ValueTextDummy);
}

function SetValueListPairs() { //Erzeugt Werte und Texte für Timer Value Listenfeld
    if (logging) log("Reaching SetValueListPairs()")

    //Mode ValueList
    setState(praefix + "ModeValues", ModeValues.join(";"));
    setState(praefix + "ModeText", ModeText.join(";"));

    //Aktion ValueList
    setState(praefix + "AktionValues", AktionValues.join(";"));
    setState(praefix + "AktionText", AktionText.join(";"));
}

function init() {
    if (logging) log("Reaching Init()")
    //    0         1           2                   3                   4                   5               6               7               8               8               10              11                  12              13              14              15                  16              17          18              19
    // "Aktiv", "Rolle", "TimerTimestamp", "TimerAstroTimestamp", "TimerAstroShift", "TimerChoice", "TimerSonntag", "TimerMontag", "TimerDienstag", "TimerMittwoch", "TimerDonnerstag", "TimerFreitag", "TimerSamstag", "SwitchTarget", "OnlyIfPresence", "OnlyIfNoPresence", "TabellenStatus", "IsEdit","DeviceStatus","TimerAktion"

    TimerCount = getState(praefix + "TimerCount").val; // Initialen Timercount mit im Dp gespeicherten Wert korrigieren
    ChoosenTimer = getState(praefix + "SwitchToTimer").val; //Aktuell (in Vis) gewählter Timer
    MsgMute = getState(praefix + "MsgMute").val;
    for (let x in Funktionen) {        // loop ueber alle Functions - Erzeugt Listen mit TimerTargets und deren Namen
        let Funktion = Funktionen[x].name;
        let TempTimerTargets = "";
        let TempTimerTargetNames = "";
        if (Funktion == undefined) {
            log("Keine Funktion gefunden");
        }
        else {
            if (typeof Funktion == 'object') Funktion = Funktion.de;
            let members = Funktionen[x].members;
            if (Funktion == WelcheFunktionVerwenden) { //Wenn Function ist z.B. TimerTarget
                for (let y in members) { // Loop über alle TimerTarget Members
                    Targets[y] = members[y];
                    TempTimerTargets += Targets[y] + ";";
                    TempTimerTargetNames += getObject(GetParentId(Targets[y]), "common").common.name + ";";
                };
                log(Targets.length + " Targets found - Targets are: " + Targets);
                TempTimerTargets = TempTimerTargets.substr(0, TempTimerTargets.length - 1); //Letzten Strichpunkt wieder entfernen
                TempTimerTargetNames = TempTimerTargetNames.substr(0, TempTimerTargetNames.length - 1);//Letzten Strichpunkt wieder entfernen
                setState(praefix + "TimerTargetValues", TempTimerTargets); //Datenpunkt für Vis Listenfeld füllen
                setState(praefix + "TimerTargetText", TempTimerTargetNames); //Datenpunkt für Vis Listenfeld füllen
            };
        };
    };

    //Alle Daten in MyTimer Array einlesen
    for (let x = 0; x < TimerCount; x++) {
        CreateTimer(x); //Erzeugt alle Timerchannels und Dps und liest diese in Array ein
    };
}

//****************************
function main() {
    if (logging) log("Reaching Main");
    init();
    CreateTimerCountList()
    SetValueListPairs();
    ConvertPresence();
    CreateTrigger();
}

function GetParentId(DpId) { //Liest Id des dem DP übergeordnetem Channel
    //if (logging) log("Reaching GetParentId, Id=" + DpId);
    if (DpId == "") return ""; //Wenn Id leer (neuer Timer)
    let parentDevicelId;

    if (DpId.indexOf("hm-rpc.") == -1 && DpId.indexOf("shelly.") == -1 && DpId.indexOf("yeelight-2.") == -1) { //Wenn kein HM und kein shelly Adapter und kein yeelight, eine Ebene zurück
        parentDevicelId = DpId.split(".").slice(0, -1).join(".");// Id an den Punkten in Array schreiben (split), das letzte Element von hinten entfernen (slice) und den Rest wieder zu String zusammensetzen
    }
    else { //Wenn HM oder Shelly dann zwei Ebenen zurück
        parentDevicelId = DpId.split(".").slice(0, -2).join("."); // Id an den Punkten in Array schreiben (split), die 2 letzten Elemente von hinten entfernen (slice) und den Rest wieder zu String zusammensetzen
    };
    //if (logging) log("DpId= " + DpId + " ParentDeviceId=" + parentDevicelId);
    return parentDevicelId;
}

function GetDeviceName(DeviceId) { //Liest Namen des zum Schaltdatenpunkt gehörenden Devices
    //if (logging) log("Reaching GetDeviceName, DeviceId=" + DeviceId + " Typeof=" + typeof (DeviceId));
    if (DeviceId == "") return ""; ///Wenn DeviceId leer (neuer Timer)
    return getObject(DeviceId, "common").common.name;
}

//******************************************************** */

function MakeCronString(whichone) { //String nach Cronsyntax zusammenbauen für Schedule
    //if (logging) log("Reaching MakeCronString(whichone), whichone="+whichone);

    let DaysSubString = "";
    for (let x = 0; x < 7; x++) {
        if (MyTimer[whichone][x + 6] == true) { //Beginnend mit dem 6ten Eintrag (TimerSonntag) die 7 Wochentage durchzählen und Werte anhängen
            DaysSubString += x + ",";
        };
    };
    DaysSubString = DaysSubString.substr(0, DaysSubString.length - 1); //Komma am Ende entfernen
    if (DaysSubString == "0,1,2,3,4,5,6") { DaysSubString = "*"; }; // Sternchen wenn alle Tage gewählt

    let tempString = "";
    if (MyTimer[whichone][5] == "time") { //Wenn Zeit gewählt
        tempString = SplitTime(MyTimer[whichone][2])[1] + " " + SplitTime(MyTimer[whichone][2])[0] + " * * " + DaysSubString;
        if (logging) log("CronString für Timer " + whichone + " erstellt " + tempString);
    }
    else if (MyTimer[whichone][5] != "time") { //Wenn Astro gewählt
        tempString = SplitTime(MyTimer[whichone][3])[1] + " " + SplitTime(MyTimer[whichone][3])[0] + " * * " + DaysSubString;
        if (logging) log("Cronstring für Timer " + whichone + " Astro erstellt " + tempString);
    };
    return tempString;
}

//spezifischen Timer setzen
function SetTimer(whichone) {
    if (MyTimer[whichone][0] == true) { //Wenn Timer aktiv
        if (logging) log("Timer " + whichone + " wird gesetzt");
        MyTimer[whichone][19] = schedule(MakeCronString(whichone), function () { //Schedule setzen und Objektvariablen TimerAktion zuweisen
            DoAction(whichone); //Geplante Aktion ausführen
            if (MyTimer[whichone][5] != "time") { //Wenn Astro gewählt
                //RefreshAstro(whichone); 
                SetChoosenAstroTime(whichone, true); //Neue Astrozeit setzen nach Ausführung
                SetTimer(whichone); //Neuen Schedule anlegen (selbstaufruf der Funktion)
            };
        });
    };
}

function KillTimer(whichone) { //spezifischen Timer löschen
    if (typeof (MyTimer[whichone][19]) != "object") return; //Wenn kein Schedule gesetzt Abbruch
    clearSchedule(MyTimer[whichone][19]);
    if (logging) log("Timer Schedule " + whichone + " killed");
}

function AstroOrTime(whichone) { //Astro oder Zeit Gateway
    if (MyTimer[whichone][5] == "time") {
        if (logging) log("Zeit gewählt " + MyTimer[whichone][2]);
    }
    else if (MyTimer[whichone][5] != "time") {
        SetChoosenAstroTime(whichone);
        if (logging) log("Astro gewählt, Variante " + MyTimer[whichone][5]);
    };
}

function SetChoosenAstroTime(whichone, GoToTomorrow) { //Zeit für gewählte Astrozeit eintragen
    let Shift = parseInt(MyTimer[whichone][4]); //Wert für Shift
    let AstroChoice = MyTimer[whichone][5].trim(); //Wert für Astroereignis

    //Berücksichtigen ob Event schon vorbei ist und dann für morgen setzen
    let today = new Date();
    let jetzt = new Date();
    let tomorrow = today.setDate(today.getDate() + 1);
    let tomorrowAstroTime = getAstroDate(AstroChoice, tomorrow);
    tomorrowAstroTime.setMinutes(tomorrowAstroTime.getMinutes() + Shift);//zammrechna
    if (logging) log(AstroChoice + " beginnt heute um:" + getAstroDate(AstroChoice).toLocaleTimeString('de-DE', { hour12: false }) + " und beginnt morgen um " + tomorrowAstroTime.toLocaleTimeString('de-DE', { hour12: false }));
    //log(getAstroDate(AstroChoice).getTime() + " " + today.getTime() + " " + today.toLocaleTimeString());
    //log("Astro=" + getAstroDate(AstroChoice) + " Heute=" + jetzt + " " + "todayzeit=" + today.toLocaleTimeString());

    let AstroTime = getAstroDate(AstroChoice); //Astrotime einlesen
    AstroTime.setMinutes(AstroTime.getMinutes() + Shift);//zammrechna
    AstroTime.toLocaleTimeString('de-DE', { hour12: false });
    if (AstroTime.getTime() <= jetzt.getTime() || GoToTomorrow == true) { //Wenn Astrozeit vor aktueller Zeit dann Astrozeit von morgen verwenden
        setState(praefix + whichone + "." + Dps[3], tomorrowAstroTime.toLocaleTimeString('de-DE', { hour12: false }));
        MyTimer[whichone][3] = tomorrowAstroTime.toLocaleTimeString('de-DE', { hour12: false });
        if (logging) log("Astrotime von morgen verwendet, Event is heute bereits vorüber = " + tomorrowAstroTime.toLocaleTimeString('de-DE', { hour12: false }));
    }
    else if (AstroTime.getTime() > jetzt.getTime()) { //Wenn Astrozeit nach aktueller Zeit dann Astrozeit von heute verwenden
        setState(praefix + whichone + "." + Dps[3], AstroTime.toLocaleTimeString('de-DE', { hour12: false }));
        MyTimer[whichone][3] = AstroTime.toLocaleTimeString('de-DE', { hour12: false });
        if (logging) log("Astrotime von heute verwendet, Event kommt heute noch = " + AstroTime.toLocaleTimeString('de-DE', { hour12: false }) + " Morgen=" + tomorrowAstroTime.toLocaleTimeString('de-DE', { hour12: false }));
    };
}

function DoAction(whichone) {
    if (logging) log("Reaching DoAction(), aktiv=" + MyTimer[whichone][0] + " Rolle=" + MyTimer[whichone][1] + " whichone=" + whichone + " Presence=" + Presence + " MyTimer[whichone][13]=" + MyTimer[whichone][13] + " MyTimer[whichone][14]=" + MyTimer[whichone][14]);
    if (MyTimer[whichone][0] == true) { //Wenn Timer aktiv
        if ((MyTimer[whichone][14] == true && Presence == true) || (MyTimer[whichone][15] == true && Presence == false) || (MyTimer[whichone][15] == true && MyTimer[whichone][14] == true)) { //Wenn "bei Anwesenheit" aktiv
            switch (MyTimer[whichone][1]) {
                case 0://Wenns die Rolle Ausschalter ist
                    setState(MyTimer[whichone][13], false);//Switchtarget deaktivieren
                    MyTimer[whichone][16] = "off";
                    log("Timer " + whichone + " hat ausgeschaltet");
                    Meldung("Timer " + whichone + ", " + GetDeviceName(GetParentId(MyTimer[whichone][13])) + ", hat ausgeschaltet");
                    break;
                case 1:// Wenn die Rolle Anschalter ist
                    setState(MyTimer[whichone][13], true); //Switchtarget aktivieren
                    MyTimer[whichone][16] = "on";
                    log(MyTimer[whichone][13] + " Timer " + whichone + " hat angeschaltet");
                    Meldung("Timer " + whichone + ", " + GetDeviceName(GetParentId(MyTimer[whichone][13])) + ", hat angeschaltet");
                    break;
                case 2:// Wenn die Rolle Umschalter ist
                    if (getState(MyTimer[whichone][13]).val) { //Aktuellen Targetstatus lesen
                        setState(MyTimer[whichone][13], false); //Switchtarget deaktivieren wenn aktueller Status true
                        MyTimer[whichone][16] = "off";
                        log("Timer " + whichone + " hat ausgeschaltet");
                        Meldung("Timer " + whichone + ", " + GetDeviceName(GetParentId(MyTimer[whichone][13])) + ", hat um= ausgeschaltet");
                    } else {
                        setState(MyTimer[whichone][13], true); //Switchtarget aktivieren wenn aktueller Status false
                        MyTimer[whichone][16] = "on";
                        log(MyTimer[whichone][13] + " Timer " + whichone + " hat angeschaltet");
                        Meldung("Timer " + whichone + ", " + GetDeviceName(GetParentId(MyTimer[whichone][13])) + ", hat um= angeschaltet");
                    };
                    break;
                default:
            };
        };
    };
}


//Zeit in Stunden und Minuten teilen für Cronstring
function SplitTime(Time) {
    let timesplit = Time.split(":", 2);
    //h = timesplit[0]  / m = timesplit[1];
    return timesplit;
}

function MakeTable() {
    //Bearbeite - Aktiv - Aktion - Mode - Zeit - Offset - Ziel - Tage - wenn anwesend - wenn abwesend
    if (logging) log("Reaching MakeTable");

    let BgColor = "";
    let style0 = "style='border: 1px solid black; padding: 5px 3px; font-size:14px; font-weight: normal; text-align: center; color:" + FontColor + "; background-color:"
    let style1 = "style='border: 1px solid black; width: 40px; padding: 5px 3px; font-size:14px; font-weight: normal; text-align: right; color:" + FontColor + "; background-color:"
    let ImgColstyle = "style='border: 1px solid black; width: 40px; padding: 0px 5px; font-size:14px; font-weight: normal; text-align: center; color:" + FontColor + "; background-color:"

    let headstyle0 = "style='border: 1px solid black; padding: 0px 5px; height: 30px; font-size:16px; font-weight: bold; text-align: center; color:" + HeadFontColor + "; background-color:"
    let headstyle1 = "style='border: 1px solid black; padding: 0px 5px; height: 30px; font-size:16px; font-weight: bold; text-align: center; color:" + HeadFontColor + "; background-color:"
    let ImgColheadstyle = "style='border: 1px solid black; height: 40px; width: 40px; text-align: center; color:" + HeadFontColor + "; background-color:"

    let MyTableHead = "<table style='width:100%; border: 1px solid black; border-collapse: collapse;'><tr>";
    let MyTable;

    if (TblShowTimerLfdCol) {
        MyTableHead = MyTableHead + "<th " + ImgColheadstyle + HeadBgColor + "'><img margin: auto; display: block; style='filter: invert(" + ImgInvert + "); height: 40px;' src='" + TblLfdImg + "'></th>";
    };
    if (TblShowTimerActiveCol) {
        MyTableHead = MyTableHead + "<th " + ImgColheadstyle + HeadBgColor + "'><img style='margin: auto; display: block; filter: invert(" + ImgInvert + "); height: 40px;' src='" + TblActiveImg + "'></th>";
    };
    if (TblShowTimerActionCol) {
        MyTableHead = MyTableHead + "<th width='80px' " + headstyle0 + HeadBgColor + "'>Aktion</th>";
    };
    if (TblShowTimerModeCol) {
        MyTableHead = MyTableHead + "<th width='60px' " + headstyle0 + HeadBgColor + "'>Modus</th>";
    };
    if (TblShowTimerTimeCol) {
        MyTableHead = MyTableHead + "<th width='40px' " + headstyle0 + HeadBgColor + "'>Zeit</th>";
    };
    if (TblShowTimerAstroOffsetCol) {
        MyTableHead = MyTableHead + "<th width='50px' " + headstyle0 + HeadBgColor + "'>+/-</th>";
    };
    if (TblShowTimerTargetCol) {
        MyTableHead = MyTableHead + "<th width='140px' " + headstyle0 + HeadBgColor + "'>Schaltziel</th>";
    };
    if (TblShowTimerTargetNameCol) {
        MyTableHead = MyTableHead + "<th width='80px' " + headstyle0 + HeadBgColor + "'>Zielname</th>";
    };
    if (TblShowTimerDaysCol) {
        MyTableHead = MyTableHead + "<th width='110px' " + headstyle0 + HeadBgColor + "'>Tage</th>";
    };
    if (TblShowTimerIfPresenceCol && PresenceDp != "") {
        MyTableHead = MyTableHead + "<th " + ImgColheadstyle + HeadBgColor + "'><img style='margin: auto; display: block; filter: invert(" + ImgInvert + "); height: 40px;' src='" + TblIfPresenceImg + "'></th>";
    };
    if (TblShowTimerIfPresenceCol && PresenceDp != "") {
        MyTableHead = MyTableHead + "<th " + ImgColheadstyle + HeadBgColor + "'><img style='margin: auto; display: block; filter: invert(" + ImgInvert + "); height: 40px;' src='" + TblIfNoPresenceImg + "'></th>";
    };

    MyTableHead = MyTableHead + "</tr>";
    MyTable = MyTableHead + "<tr>";

    for (let x = 0; x < MyTimer.length; x++) { //Alle Timer durchlaufen 

        if (MyTimer[x][18]) { //Wenn Zieldatenpunkt true
            if (MyTimer[x][1] == 1) { //Wenn Zielschaltung ist anschalten
                MyTimer[x][16] = "on";
            } else {//Wenn Zielschaltung ist ausschalten
                MyTimer[x][16] = "";
            };
        } else {//Wenn Zieldatenpunkt false
            if (MyTimer[x][1] == 0) { //Wenn Zielschaltung ist ausschalten
                MyTimer[x][16] = "off";
            } else {//Wenn Zielschaltung ist ausschalten
                MyTimer[x][16] = "";
            };
        };

        switch (MyTimer[x][16]) {
            case "on":
                BgColor = TblOnBgColor;
                break;
            case "off":
                BgColor = TblOffBgColor;
                break;
            case "idle":
                BgColor = TblIdleBgColor;
                break;
            default:
                BgColor = "";
        };
        if (ChoosenTimer == x) {
            MyTable += "<tr style='border: 3px solid " + TblChoosenColor + ";'>"
        }
        else {
            MyTable += "<tr style='border: 1px solid black;'>"
        }
        if (MyTimer[x][17]) { //Edit in Progress
            //log(MyTimer[x][17])
            BgColor = TblEditBgColor;
        };

        if (TblShowTimerLfdCol) {
            MyTable += "<td " + ImgColstyle + BgColor + "'>" + (x + 1) + "</td>";
        };
        if (TblShowTimerActiveCol) {
            if (MyTimer[x][0]) { //Wenn timer aktiv
                MyTable += "<td " + ImgColstyle + BgColor + "'>" + "X" + "</td>";
            }
            else {
                MyTable += "<td " + ImgColstyle + BgColor + "'>" + " " + "</td>";
            };
        };
        if (TblShowTimerActionCol) {
            MyTable += "<td " + style0 + BgColor + "'>" + AktionText[MyTimer[x][1]] + "</td>";
        };
        if (TblShowTimerModeCol) {
            MyTable += "<td " + style0 + BgColor + "'>" + ModeText[ModeValues.indexOf(MyTimer[x][5])] + "</td>";
        };
        if (TblShowTimerTimeCol) {
            if (MyTimer[x][5] == "time") {
                MyTable += "<td " + style0 + BgColor + "'>" + MyTimer[x][2] + "</td>";
            }
            else {
                MyTable += "<td " + style0 + BgColor + "'>" + MyTimer[x][3] + "</td>";
            }
        };
        if (TblShowTimerAstroOffsetCol) {
            MyTable += "<td " + style1 + BgColor + "'>" + MyTimer[x][4] + " Min.</td>";
        };
        if (TblShowTimerTargetCol) {
            MyTable += "<td " + style1 + BgColor + "'>" + MyTimer[x][13] + "</td>";
        };
        if (TblShowTimerTargetNameCol) {
            //log("MyTimer[x][13]=" + MyTimer[x][13] + " x=" + x)
            MyTable += "<td " + style1 + BgColor + "'>" + GetDeviceName(GetParentId(MyTimer[x][13])) + "</td>";
        };
        if (TblShowTimerDaysCol) {
            let TempDaysString = "";
            let DaysCounter = 0;
            for (let y = 0; y < Wochentage.length; y++) {
                if (MyTimer[x][y + 6]) {
                    TempDaysString += Wochentage[y].substr(0, 2) + "./ ";
                    DaysCounter++;
                };
            };
            if (DaysCounter == 7) TempDaysString = "Alle Tage";
            MyTable += "<td " + style0 + BgColor + "'>" + TempDaysString + "</td>";
        };
        if (TblShowTimerIfPresenceCol && PresenceDp != "") {
            if (MyTimer[x][14]) {
                MyTable += "<td " + ImgColstyle + BgColor + "'>" + "X" + "</td>";
            } else {
                MyTable += "<td " + ImgColstyle + BgColor + "'>" + " " + "</td>";
            };
        };
        if (TblShowTimerIfPresenceCol && PresenceDp != "") {
            if (MyTimer[x][15]) {
                MyTable += "<td " + ImgColstyle + BgColor + "'>" + "X" + "</td>";
            } else {
                MyTable += "<td " + ImgColstyle + BgColor + "'>" + " " + "</td>";
            };
        };

        MyTable += "</tr>";
    };

    MyTable += "</table>";
    setState(praefix + "TimerOverviewTable", MyTable);
    //if (logging) log(MyTable);
}

function WriteToTimer(whichone) { //Schreibt Daten vom Template in bestimmten Timer
    if (logging) log("Reaching WriteToTimer, whichone=" + whichone)
    let TempVal;
    for (let y = 0; y < Dps.length; y++) {
        TempVal = getState(praefix + "Template" + "." + Dps[y]).val
        if (y == 4) TempVal = parseInt(TempVal); //Workaround für jqui Input welches immer Strings liefert
        setState(praefix + whichone + "." + Dps[y], TempVal);
        MyTimer[whichone][y] = TempVal;
    };
    KillTimer(whichone); //Vorhandenen Timer/Schedule löschen
    AstroOrTime(whichone); //Modus bestimmen
    SetTimer(whichone); // Timer/Schedule aktualisieren
    SwitchEditMode(whichone, false); //Editmode deaktivieren
    CreateDeviceTrigger(whichone)
    MakeTable(); //Tabelle refreshen
}

function AddNewTimer() {
    if (logging) log("Reaching AddNewTimer");
    TimerCount++;
    setState(praefix + "TimerCount", TimerCount);
    if (logging) log("Timercount=" + TimerCount);
    let x = TimerCount - 1;
    CreateTimer(x)
    CreateTimerCountList();//Timer Value List aktualisieren

    setTimeout(function () { //Warten bis neuer Timer angelegt
        setState(praefix + "SwitchToTimer", TimerCount - 1); //Dann zu neuem Timer wechseln
    }, 250);
}


function DeleteTimer(whichone = ChoosenTimer) {
    if (logging) log("Reaching DeleteTimer(whichone), whichone=" + whichone);
    if (TimerCount == 1) return; //Letzten Timer nie löschen, Funktion verlassen
    let TempArray = [];
    let NewArray = [];

    KillTimer(whichone); //Vorhandenen Timer/Schedule löschen

    if (whichone == 0) { //Erster Eintrag des Arrays soll gelöscht werden
        NewArray = MyTimer.slice(whichone + 1, TimerCount);
    }
    else if (whichone == TimerCount - 1) {//Letzter Eintrag des Arrays soll gelöscht werden
        NewArray = MyTimer.slice(0, whichone);
    }
    else { //Eintrag aus der Mitte des Array soll gelöscht werden
        NewArray = TempArray.concat(MyTimer.slice(0, whichone - 1), MyTimer.slice(whichone, TimerCount));
    };
    TimerCount--; //Nach löschen im Array, Timerzähler -1
    setState(praefix + "TimerCount", TimerCount); //TimerCount in Objektliste aktualisieren
    CreateTimerCountList();//Timer Value List aktualisieren
    MyTimer = NewArray;

    //if (logging) log("whichone=" + whichone + " TimerCount=" + TimerCount)
    //if (logging) log("MyTimer.length=" + MyTimer.length + " NewArray.length=" + NewArray.length + " NewArray=" + NewArray);

    //Alle Channels neu schreiben, dann letzten Channel komplett rekursiv löschen
    for (let x = 0; x < TimerCount; x++) {
        for (let y = 0; y < Dps.length; y++) {
            //log("setState(" + praefix + x + "." + Dps[y] + " , " + MyTimer[x][y]);
            setState(praefix + x + "." + Dps[y], MyTimer[x][y]);
        };
    };
    setState(praefix + "SwitchToTimer", TimerCount - 1); //Dann zu vorherigem Timer wechseln
    log("Now Delete last channel=" + praefix + (TimerCount));
    deleteObject(praefix + (TimerCount), true); //Löscht gesamten Channel

    MakeTable();
}

function WriteToTemplate(whichone) { //Schreibt Werte von bestimmten Timer ins Template
    if (logging) log("Reaching WriteToTemplate(whichone), whichone=" + whichone);
    for (let y = 0; y < Dps.length; y++) {
        //log(MyTimer[whichone][y])
        if (typeof MyTimer[whichone][y] !== "undefined") setState(praefix + "Template" + "." + Dps[y], MyTimer[whichone][y]);
    };
}

function SwitchEditMode(whichone, onoff) { //Aktiviert/deaktiviert Edit Modus für bestimmten Timer
    if (logging) log("Reaching SwitchEditMode(whichone, onoff), whichonex=" + whichone + " TimerCount=" + TimerCount + " onoff=" + onoff);
    if (whichone < TimerCount) MyTimer[whichone][17] = onoff; //Sicherstellen das Timereintrag noch existiert (ist nach Löschung nicht der Fall) und Wert setzen
    MakeTable();
}

function CreateDeviceTrigger(x) {    //TargetDeviceTrigger
    if (logging) log("Reaching CreateDeviceTrigger()");
    if (MyTimer[x][0] && MyTimer[x][13] != "") { //Wenn Timer ist aktiv und Ziel nicht leer
        if (logging) log("Subscription added for " + MyTimer[x][13] + " at Timer " + x);
        on(MyTimer[x][13], function (dp) { //Timer Zieldatenpunkt
            if (logging) log("TargetDevice " + x + " state changed, refreshing table");
            MyTimer[x][18] = dp.state.val; //Aktuellen Status MyTimer Array [18] zuweisen
            MakeTable();
        });
    }
    else if (!MyTimer[x][0] && MyTimer[x][13] != "") {
        if (logging) log("Subscription unsubscribed for " + MyTimer[x][13] + " at Timer " + x);
        unsubscribe(MyTimer[x][13]);
    };
}


function CreateTrigger() {
    if (logging) log("Reaching CreateTrigger()");

    // Template Trigger
    for (let x = 0; x < Dps.length; x++) { //Alle Template Dps durchgehen und Trigger setzen
        on(praefix + "Template." + Dps[x], function (dp) {
            //log("SwitchingInProgress =" + SwitchingInProgress)
            if (!SwitchingInProgress) {
                SwitchEditMode(ChoosenTimer, true);
            };
        });
    };

    //Trigger für Root Dps
    on(praefix + "SwitchToTimer", function (dp) { //Bei Änderung Timer (Valuelist in Vis)
        ChoosenTimer = dp.state.val;
        SwitchingInProgress = true; //Steuervariable setzen um ungewolltes Triggern und aktivieren des Edit Modes zu vermeiden
        WriteToTemplate(dp.state.val); //Nach Änderung Werte ins Template schreiben
        SwitchEditMode(dp.oldState.val, false); //Editmode bei Timerwechsel verwerfen
        setTimeout(function () {
            SwitchingInProgress = false //Steuervariable nach Zeit x zurücksetzen
        }, 500);
        if (logging) log("Timertemplate geändert auf " + dp.state.val);
    });

    on(praefix + "SaveEdit", function (dp) { //Bei Änderung  SaveEdit (Save Button in Vis)
        if (dp.state.val) {
            WriteToTimer(ChoosenTimer);
            setTimeout(function () {
                if (logging) log("Settings saved")
                setState(praefix + "SaveEdit", false); //State wieder zurücksetzen nach einer Sek. (erzeugt kurze Farbbestätigung in Vis) um erneut definiert auf true triggern zu können
            }, 1000);
        };
    });

    on(praefix + "AddTimer", function (dp) { //Bei Änderung AddTimer (Button in Vis)
        if (logging) log("AddTimer triggered, val=" + dp.state.val)

        if (dp.state.val) {
            AddNewTimer();
            setTimeout(function () {
                setState(praefix + "AddTimer", false);
            }, 500);
        };
    });

    on(praefix + "DelTimer", function (dp) { //Bei Änderung DeleteTimer (Button in Vis)

        if (dp.state.val) {
            DeletionInProgress = true
            setTimeout(function () {
                DeletionInProgress = false
                setState(praefix + "DelTimer", false);
            }, 3000);
        }
        else if (!dp.state.val && DeletionInProgress) {
            DeleteTimer();
            DeletionInProgress = false
        };
    });

    on(praefix + "MsgMute", function (dp) { //Bei Änderung AddTimer (Button in Vis)
        if (logging) log("MsgMute triggered, val=" + dp.state.val)
        MsgMute = dp.state.val;
    });


    //Sondertrigger
    if (PresenceDp != "") { //Trigger nur erstellen wenn Anwesenheitsdatenpunkt vorhanden
        on(PresenceDp, function (dp) { //Bei Änderung Anwesenheitsdatenpunkt
            ConvertPresence(dp.state.val);
        });
    };

    onStop(function () { //Bei Scriptende alle Timer löschen
        for (let x = 0; x < TimerCount; x++) {
            KillTimer(x);
        };
    }, 100);
}




