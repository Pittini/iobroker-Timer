# Legt eine beliebige Anzahl von Timern an mit folgenden Features:

## Features
1. Alle benötigten Datenpunkte werden automatisch erstellt.
2. Jeder Timer steuert genau einen Schaltvorgang mit true/false. Für einen kompletten ein/aus Zyklus müssen also 2 Timer genutzt werden.
3. Timer bietet die Option "Nur bei Anwesenheit" bzw. "Nur bei Abwesenheit" und greift hierfür auf einen schon vorhandenen Anwesenheitsdatenpunkt zu.
4. Timer ist ein Wochentimer, jeder Tag kann separat an/ab -gewählt werden.
5. Timer hat Astrofunktion, bei Auswahl einer Astrofunktion kann hier zusätzlich ein +- Offset angegeben werden.
6. Timer wird komplett via Vis gesteuert, keinerlei Skriptänderungen nötig um Timer anzulegen, zu löschen oder zu ändern.
7. Vis zeigt Status der Schaltziele durch Farbwechsel.

## WICHTIG!!!
### Vorraussetzungen: Den zu schaltenden Geräten/Datenpunkten muss eine Funktion, z.B. "TimerTarget" zugewiesen sein.   Dieser muss einen boolschen Wert (true/false) beinhalten.
### **<span style="color:red">Aber nur für den Datenpunkt, nicht den gesamten Channel!!!</span>**  

![timertut1.png](/admin/timertut1.png) 

# Installation
1. Wenn noch nicht geschehen, allen gewünschten Zieldatenpunkten eine Funktion zuweisen. Die Funktion muss vorher in den Aufzählungen hinzugefügt werden und könnte z.B. "TimerTarget" lauten. Soll ein anderer Begriff verwendet werden, muss dies dann auch im Script geändert werden. **Nach der Zuweisung, bzw. dem anlegen neuer Aufzählungspunkte ist es oft hilfreich die JS Instanz neu zu starten da diese bei Aufzählungsänderungen gerne mal "zickt" was dann zu Skriptfehlern führt**.
2. Das Skript in ein neues JS Projekt kopieren.
3. Als nächstes (Zeile 9) gebt Ihr den Datenpunkt für An/Abwesenheit an.  
Dieser darf numerische oder boolsche Werte beinhalten. Habt Ihr keinen entsprechenden Datenpunkt tragt "" ein.
4. Das Script starten.  
Im Hintergrund werden nun alle benötigten Channels und Datenpunkte unter dem Channel der in Zeile 7 angegeben wurde, angelegt. Als default ist das: "javascript.0.Timer".
5. Ab hier habt Ihr mit dem Skript und der Objektliste nichts mehr zu tun, alles weitere wird via Vis erledigt, ihr solltet nun die beigefügte Vorlage (TimerView.txt) via "Widgets importieren" in Euer Vis Projekt integrieren und aufrufen.

## Bedienung und Anzeigen des Vis Views
Vorab der Hinweis, dass alle in der Tabelle verwendeten Icons und Farben in den Skript/Tabelleneinstellungen verändert werden können. Wie in all meinen Skripten wird für die Icons der Iconsatz "icons-mfd-svg" verwendet. Ist dieser Satz installiert, so seht Ihr dies in der Liste der installierten Instanzen. Ist er dort nicht aufzufinden solltet Ihr ihn installieren (als Adapter).  
Der View besteht im wesentlichen aus zwei Bereichen. Der erste, obere, Bereich mit den Einstellfeldern und den Kontrollelementen für speichern/hinzufügen/löschen von Timern, sowie der Übersichtstabelle unten, in der Ihr alle angelegten Timer und deren Status seht.  
### Nun zur Funktion der einzelnen Elemente:
1. **Das Listenfeld "Timer"** - Hier wählt Ihr aus welchen Timer Ihr mit den nachfolgenden Elementen bearbeiten möchtet. Der gewählte Timer wird zur optischen Bestätigung in der Übersichtstabelle dunkelgelb (ocker) dargestellt.
2. **Der Button "on/off"** - Hiermit könnt Ihr den jeweiligen Timer aktivieren oder deaktivieren ohne ihn gleich zu löschen.
3. **Das Listenfeld "Aktion"** - hier legt Ihr fest was dieser Timer tun soll. anschalten (true), ausschalten (false) oder umschalten. Die Variante "umschalten" dreht den jeweils aktuellen Status des Datenpunktes um, ist dieser true, wird er auf false gesetzt und umgekehrt.  
Bitte beachtet das ein kompletter Schaltzyklus von an- und ausschalten aus zwei Timereinträgen besteht!
4. **Das Listenfeld "Modus"** - Hier wird festgelegt ob der Timer zu einer (im nachfolgenden Feld) eingegebenen Zeit schalten soll, oder ob eine der verfügbaren Astroschaltzeiten (Sonnenaufgang, Sonnenuntergang usw.) verwendet werden soll.
5. **Das Eingabe/Anzeige Feld "Zeit"** - Dieses Feld hat zwei unterschiedliche Funktionen/Verhalten, je nachdem was unter Modus eingestellt wurde. Wurde dort als Modus "Zeit" gewählt, so dient dieses Feld zur Eingabe der Schaltzeit. Wurde eine Astrofunktion gewählt wird es zu einem reinen Anzeigefeld in das Ihr nichts eingeben könnt und zeigt Euch die durch die Astrofunktion vorgegebene Schaltzeit an.
6. **Das Eingabefeld "Offset"** - Wurde unter Modus eine Astrofunktion gewählt, so könnt Ihr hier eine Offsetzeit ,sowohl positiv als auch negativ, in Minuten angeben. Wurde Modus "Zeit" gewählt ist diese Option nicht verfügbar.
7. **Das Listenfeld "Ziel"** - Hier wählt Ihr aus welches Ziel geschaltet werden soll. Die hier vorhandenen Einträge, sind die Namen jener Id's, welche Ihr der Funktion "TimerTarget" zugewiesen habt. Schaltbar ist grundsätzlich alles was mit true/false gesteuert wird, egal ob Lampen, Steckdosen oder auch Skripte, Datenpunkte usw.
8. **Die Buttons der "Tage"** - Hiermit legt Ihr fest an welchen Tagen der Timer schaltet (Grün=aktiv, grau=inaktiv).
9. **Der Button "Haus mit Person"** - Legt fest das nur bei Anwesenheit geschaltet wird (Grün=aktiv, grau=inaktiv).  
Solltet Ihr keinen Anwesenheitsdatenpunkt eingetragen haben, so ist dieser Button, sowie die zugehörige Spalte in der Übersichtstabelle nicht sichtbar. Skriptintern wird die Anwesenheit auf true gesetzt.
10.  **Der Button "Haus leer"** - Legt fest das bei nur Abwesenheit geschaltet wird (Grün=aktiv, grau=inaktiv).  
Solltet Ihr keinen Anwesenheitsdatenpunkt eingetragen haben, so ist dieser Button, sowie die zugehörige Spalte in der Übersichtstabelle nicht sichtbar. Skriptintern wird die Anwesenheit auf true gesetzt.

Aus Sicherheits/Fehlbedienungs-gründen und um Schreibzugriffe zu minimieren werden geänderte Einstellungen erst gespeichert wenn Ihr dies explizit veranlasst. Hierzu dient:  

11.  **Der Button "Diskette"**  - Durch Klick auf diesen werden die getroffenen Einstellungen gespeichert. Dieses wird optisch bestätigt durch kurzen Farbwechsel zu grün und zurück zu grau.

Um einen neuen Timereintrag anzulegen verwendest Du: 

12.  **Den Button "+"** - Ein klick auf diesen Button erzeugt einen neuen Eintrg und setzt den Fokus auf diesen so das Du sofort im Editbereich die gewünschten Werte eintragen kannst. Speichern nicht vergessen!

Zuguterletzt gibt es noch die Möglichkeit den Timer mit dem aktuellen Fokus zu löschen, hierzu dient:

13. **Der Button "Papierkorb"** - Um versehentliches Löschen zu erschweren hat dieser Button eine Sicherheitsabfrage. Der erste Klick auf den Button "Papierkorb" läßt dessen Farbe zu rot wechseln, das Symbol wandelt sich zu einem Fragezeichen. Erst ein weiterer Klick, nunmehr auf das Fragezeichen, innerhalb 3 Sekunden, löscht den Eintrag tatsächlich und unwiederbringlich. Läßt Du die 3 Sekunden ohne Klick verstreichen, wandelt sich der Button zurück zum Papierkorb, der Löschmodus wird abgebrochen.

### Farben der Übersichtstabelle
**Ocker** bzw "dunkelgelb" zeigt Dir den Eintrag mit aktuellem Fokus. Änderungen im Editbereich würden sich auf genau diese Zeile auswirken. Sobald Du im Editbereich eine erste Änderung vornimmst, wandelt sich die Farbe in:

**hellgelb** und zeigt Dir damit an das Du bereits eine Änderung vorgenommen hast. Gespeichert wird diese aber, wie oben beschrieben, erst, wenn Du ds Diskettensymbol anklickst.

**grün** dargestellt werden alle Einträge welche einstellungsgemäß **eingeschaltet** wurden. Wird manuell oder durch einen anderen Timer der Status verändert, wechselt die Zeile wieder zu grau.

**rot** dargestellt werden alle Einträge welche einstellungsgemäß **ausgeschaltet** wurden. Wird manuell oder durch einen anderen Timer der Status verändert, wechselt die Zeile wieder zu grau.

Das wars, viel Spaß.



## Changelog
### V2.0.1 Beta (22.5.2020)
* Add: einige Logpunkte hinzugefügt
### V2.0.0 Beta (22.5.2020)
* Release V2 Beta
### V1.1.2 (7.2.2020)
* Bugfix: Presence Trigger hinzugefügt

### V1.1.1 (26.1.2020)
* Add: Readme erstellt

### V1.1.0 (18.12.2019)
* Add: Schaltoptionen "Nur bei Anwesenheit" und "Nur bei Abwesenheit" hinzugefügt

### V1.0.0 (2019-10-28)
* Initial Release