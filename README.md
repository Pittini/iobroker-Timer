# Legt eine beliebige Anzahl von Timern an mit Folgenden Eigenschaften:
* 1. Alle benötigten Datenpunkte werden automatisch erstellt
* 2. Jeder Timer steuert genau einen Schaltvorgang mit true/false. Für einen kompletten ein/aus Zyklus müssen also 2 Timer angelegt werden
* 3.  Timer bietet die Option "Nur bei Anwesenheit" bzw. "Nur bei Abwesenheit" und greift hierfür auf einen schon vorhandenen Anwesenheitsdatenpunkt zu
* 4. Timer ist ein Wochentimer, jeder Tag kann separat an/ab -gewählt werden
* 5. Timer hat Astrofunktion, bei Auswahl kann hier zusätzlich ein +- Offset angegeben werden

Das vis verwendet das Material Design Script+CSS von Uhula. Wer das nicht hat, wird das vis anpassen müssen damits wieder nach was aussieht, Funktion ist auf jeden Fall gegeben.

Das Script sollte vor dem ersten Start angepasst werden, Ganz oben steht Anzahl Timer=10, hier eintragen wie viele angelegt werden sollen. Einschalten und wieder Ausschalten sind 2!! Timer. 
Dann das Script starten, es wird Fehlermeldungen geben, diese ignorieren und das Script restarten, jetzt sollte es keine Fehler mehr geben.
Es sollte sich jetzt unter javascript.0 der Eintrag Timer befinden und darunter die Anzahl der Timer die Ihr gewählt habt. Ganz am Ende der Liste findet Ihr zwei Datenpunkte namens TimerTargets und TimerTargetNames. Unter TimerTargets schreibt Ihr jetzt alle Datenpunkte rein welche geschaltet werden sollen, Trennzeichen ist Strichpunkt; Im Datenpunkt TimerTargetNames schreibt ihr in der gleichen Reihenfolge beliebige frei wählbare Smartnames/Kurznamen für die zu schaltenden Datenpunkte rein. Damit wäre der Scriptteil erledigt.

Das beiliegende Vis ist für 1nen Timer, einfach so oft wie benötigt kopieren und einsetzen. Um Anpassungszeit zu sparen, könnt ihr z.B. mit Word über Suchen und Ersetzen den Eintrag Timer1 suchen und mit Timer2....3....4...usw. ersetzen und dann einfügen. Geht fix und man vergisst nix.

Das wars, viel Spaß.