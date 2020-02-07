# Legt eine beliebige Anzahl von Timern an mit folgenden Eigenschaften:

1. Alle benötigten Datenpunkte werden automatisch erstellt
2. Jeder Timer steuert genau einen Schaltvorgang mit true/false. Für einen kompletten ein/aus Zyklus müssen also 2 Timer angelegt werden
3. Timer bietet die Option "Nur bei Anwesenheit" bzw. "Nur bei Abwesenheit" und greift hierfür auf einen schon vorhandenen Anwesenheitsdatenpunkt zu
4. Timer ist ein Wochentimer, jeder Tag kann separat an/ab -gewählt werden
5. Timer hat Astrofunktion, bei Auswahl kann hier zusätzlich ein +- Offset angegeben werden

Das vis verwendet das [Material Design Script+CSS von Uhula](https://github.com/Uhula/ioBroker-Material-Design-Style). Wer das nicht hat, wird das vis anpassen müssen damits wieder nach was aussieht, die Funktion ist auf jeden Fall gegeben.

Das Script sollte vor dem ersten Start angepasst werden, in Zeile 4 steht *AnzahlTimer=10*, hier eintragen wie viele angelegt werden sollen. Einschalten und wieder Ausschalten sind 2!! Timer. 
Als nächstes (Zeile 5) gebt Ihr den Datenpunkt für An/Abwesenheit an.
Dann das Script starten, es wird Fehlermeldungen geben, diese ignorieren und das Script restarten, jetzt sollte es keine Fehler mehr geben.
Es sollte sich jetzt unter javascript.0 der Eintrag Timer befinden und darunter die Anzahl der Timer die Ihr gewählt habt. Ganz am Ende der Liste findet Ihr zwei Datenpunkte namens TimerTargets und TimerTargetNames. Unter TimerTargets schreibt Ihr jetzt alle Datenpunkte rein welche geschaltet werden sollen, Trennzeichen ist Strichpunkt/Semikolon/; Im Datenpunkt TimerTargetNames schreibt ihr in der gleichen Reihenfolge beliebige frei wählbare Smartnames/Kurznamen für die zu schaltenden Datenpunkte rein. Damit wäre der Scriptteil erledigt.

Das beiliegende Vis ist für 1nen Timer, einfach so oft wie benötigt kopieren und einsetzen. Um Anpassungszeit zu sparen, könnt ihr z.B. mit Word über Suchen und Ersetzen den Eintrag Timer1 suchen und mit Timer2....3....4...usw. ersetzen und dann einfügen. Geht fix und man vergisst nix.

Das wars, viel Spaß.


## Todo
- Nothing planned atm
- ...

## Changelog
### 1.1.2 (2020-02-07)
* (pittini) Bugfix: Presence Trigger hinzugefügt

### 1.1.1 (2020-01-26)
* (pittini) Readme erstellt

### 1.1.0 (2019-12-18)
* (pittini) Added: Schaltoptionen "Nur bei Anwesenheit" und "Nur bei Abwesenheit" hinzugefügt

### 1.0.0 (2019-10-28)
* (pittini) Initial Release