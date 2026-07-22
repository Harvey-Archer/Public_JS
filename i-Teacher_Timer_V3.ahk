/*
================================================================================
    i-Teacher Timer V3
    A lightweight, always-on-top classroom timer for AutoHotkey v2.
    
    Features:
    - Dynamic text scaling for multi-line lesson parts
    - Compact 199x269 footprint with vertical progress rail
    - Safe-click interactive buttons (Info and Close)
    - Full UTF-8 support for lesson files
    
    Hotkeys:
    - F8        : Start / Pause the timer
    - F9        : Skip to the next section
    - F10       : Add 2 minutes
    - F11       : Remove 2 minutes
    - F12       : End the lesson early
    - Ctrl+Alt+R: Restart current section
    - Ctrl+Alt+H: Show / Hide the timer HUD
    - Ctrl+Alt+C: Toggle click-through mode
    - Ctrl+Alt+O: Open a new lesson plan
================================================================================
*/

#Requires AutoHotkey v2.0
#SingleInstance Force
#UseHook True
InstallKeybdHook
Persistent

global UI_W := 199, UI_H := 269
global lesson := [], idx := 1, remain := 0, duration := 0, lastTick := 0
global paused := true, transitioning := false, warned := false
global visible := true, clickThrough := false, gx := "", gy := ""
global tipVisible := false

global hud := Gui("+AlwaysOnTop -Caption +ToolWindow -DPIScale")
hud.BackColor := "EDEDED", hud.MarginX := 0, hud.MarginY := 0
hud.SetFont("s8 c111827", "Segoe UI")

; Exact reference footprint: 199 x 269 physical pixels.
; Progress rail is now on the left and 300% wider than the previous 5 px rail.
global rail := hud.AddProgress("x8 y26 w15 h182 Vertical Range0-100 c2563EB BackgroundD1D5DB", 100)

global titleTxt := hud.AddText("x31 y15 w158 h55 Center c111827", "LESSON CUE TIMER")
titleTxt.SetFont("s11 bold")

global timeTxt := hud.AddText("x28 y75 w164 h65 Center 0x200 c0F172A", "00:00")
timeTxt.SetFont("s33 bold")

global nextTxt := hud.AddText("x31 y155 w158 h55 Center c334155", "-")
nextTxt.SetFont("s11")

global bottomRule := hud.AddProgress("x31 y226 w158 h1 Range0-100 cCBD5E1 BackgroundCBD5E1", 100)
global statusTxt := hud.AddText("x31 y236 w109 h20 Center 0x200 c1E3A8A", "PAUSED  1/1")
statusTxt.SetFont("s7 bold")
global infoTxt := hud.AddText("x140 y235 w20 h22 Center 0x200 c2563EB", "ⓘ")
infoTxt.SetFont("s11 bold", "Segoe UI Symbol")
infoTxt.OnEvent("Click", ToggleShortcutTip)
global closeTxt := hud.AddText("x167 y234 w22 h22 Center 0x200 cDC2626", "⨂")
closeTxt.SetFont("s11 bold", "Segoe UI Symbol")
closeTxt.OnEvent("Click", (*) => ExitApp())

BuildTray()
OnMessage(0x84, DragHUD)
lessonDir := A_ScriptDir "\lessons"
startDir := DirExist(lessonDir) ? lessonDir : A_ScriptDir
lessonPath := FileSelect(3, startDir, "Choose lesson", "Lesson plans (*.txt)")
if !lessonPath
    ExitApp()
LoadLesson(lessonPath)
ShowHUD()
UpdateHUD()
SetTimer(Tick, 200)

RegisterHotkeys()

RegisterHotkeys() {
    ; Programmatic hotkeys are more reliable than label-style hotkeys after UI restructuring.
    Hotkey("F8", (*) => TogglePause(), "On")
    Hotkey("F9", (*) => NextSection(), "On")
    Hotkey("F10", (*) => Adjust(120), "On")
    Hotkey("F11", (*) => Adjust(-120), "On")
    Hotkey("F12", (*) => Finish(), "On")
    Hotkey("^!r", (*) => StartSection(true), "On")
    Hotkey("^!h", (*) => ToggleHUD(), "On")
    Hotkey("^!c", (*) => ToggleClicks(), "On")
    Hotkey("^!o", (*) => OpenLesson(), "On")
}

BuildTray() {
    A_TrayMenu.Delete()
    A_TrayMenu.Add("Start / Pause`tF8", (*) => TogglePause())
    A_TrayMenu.Add("Next`tF9", (*) => NextSection())
    A_TrayMenu.Add("Add 2 minutes`tF10", (*) => Adjust(120))
    A_TrayMenu.Add("Remove 2 minutes`tF11", (*) => Adjust(-120))
    A_TrayMenu.Add()
    A_TrayMenu.Add("Exit", (*) => ExitApp())
}
LoadLesson(path) {
    global lesson, idx, paused
    lesson := []
    content := FileRead(path, "UTF-8")
    Loop Parse, content, "`n", "`r" {
        line := Trim(A_LoopField)
        if (line = "" || SubStr(line,1,1) = "#" || SubStr(line,1,1) = ";")
            continue
        parts := StrSplit(line, "|")
        if (parts.Length != 2 || !RegExMatch(Trim(parts[2]), "^(?:\d+\.?\d*|\.\d+)$"))
            throw Error("Use: Activity|minutes")
        lesson.Push({name: Trim(parts[1]), sec: Round(Number(Trim(parts[2]))*60)})
    }
    if !lesson.Length
        throw Error("No activities found.")
    idx := 1, paused := true
    StartSection(false)
}
ShowHUD() {
    global hud, UI_W, UI_H, gx, gy
    x := gx = "" ? A_ScreenWidth-UI_W-18 : gx
    y := gy = "" ? 18 : gy
    hud.Show("x" x " y" y " w" UI_W " h" UI_H " NoActivate")
}
StartSection(run := true) {
    global lesson, idx, remain, duration, lastTick, paused, transitioning, warned
    if (idx > lesson.Length) {
        Complete()
        return
    }
    duration := lesson[idx].sec*1000, remain := duration, warned := false
    transitioning := false, paused := !run, lastTick := A_TickCount
    UpdateHUD()
}
Tick() {
    global paused, transitioning, remain, lastTick, warned
    if (paused || transitioning)
        return
    now := A_TickCount, remain -= now-lastTick, lastTick := now
    if (!warned && remain <= 120000 && remain > 0) {
        warned := true
        Warning()
    }
    if (remain <= 0) {
        remain := 0
        UpdateHUD()
        EndSection()
    } else {
        UpdateHUD()
    }
}
UpdateHUD() {
    global lesson, idx, remain, duration, paused, titleTxt, timeTxt, nextTxt, rail, statusTxt
    if (idx < 1 || idx > lesson.Length)
        return
    seconds := Ceil(Max(0,remain)/1000)
    
    titleStr := StrUpper(lesson[idx].name)
    if (!titleTxt.HasProp("FullText") || titleTxt.FullText != titleStr) {
        finalText := ""
        titleSize := GetOptimalFontSize(titleStr, 158, 55, 11, 7, "bold", &finalText)
        titleTxt.SetFont("s" titleSize " bold", "Segoe UI")
        titleTxt.Value := finalText
        titleTxt.FullText := titleStr
    }

    nextName := idx < lesson.Length ? lesson[idx+1].name : "Finish lesson"
    if (!nextTxt.HasProp("FullText") || nextTxt.FullText != nextName) {
        finalNext := ""
        nextSize := GetOptimalFontSize(nextName, 158, 55, 11, 7, "norm", &finalNext)
        nextTxt.SetFont("s" nextSize " norm", "Segoe UI")
        nextTxt.Value := finalNext
        nextTxt.FullText := nextName
    }

    timeTxt.Value := Format("{:02}:{:02}", Floor(seconds/60), Mod(seconds,60))
    rail.Value := Max(0, Min(100, Round(remain/duration*100)))
    statusTxt.Value := (paused ? "PAUSED" : "RUNNING") "  " idx "/" lesson.Length
}

GetOptimalFontSize(text, w, maxH, maxS, minS, fontOptions, &outText) {
    outText := text
    size := maxS
    Loop {
        tempGui := Gui("-DPIScale")
        tempGui.SetFont("s" size " " fontOptions, "Segoe UI")
        tempTxt := tempGui.AddText("w" w, outText)
        tempTxt.GetPos(,, &outW, &outH)
        tempGui.Destroy()
        
        if (outH <= maxH)
            return size
            
        if (size <= minS)
            break
        size--
    }
    
    ; If minimum size still exceeds bounds, gracefully truncate
    baseText := text
    Loop {
        baseText := SubStr(baseText, 1, -1)
        outText := baseText "..."
        tempGui := Gui("-DPIScale")
        tempGui.SetFont("s" minS " " fontOptions, "Segoe UI")
        tempTxt := tempGui.AddText("w" w, outText)
        tempTxt.GetPos(,, &outW, &outH)
        tempGui.Destroy()
        if (outH <= maxH || StrLen(baseText) < 2)
            return minS
    }
}
ToggleShortcutTip(*) {
    global tipVisible
    if tipVisible {
        HideShortcutTip()
        return
    }
    MouseGetPos(&mouseX, &mouseY)
    ToolTip("F8  Pause / Resume`nF9  Next section`nF10 Add 2 minutes`nF11 Remove 2 minutes", mouseX - 165, mouseY - 92)
    tipVisible := true
    SetTimer(HideShortcutTip, -6000)
}
HideShortcutTip() {
    global tipVisible
    ToolTip()
    tipVisible := false
}
TogglePause() {
    global paused, transitioning, lastTick
    if transitioning
        return
    paused := !paused, lastTick := A_TickCount
    HideShortcutTip()
    UpdateHUD()
}
NextSection() {
    global idx, lesson, transitioning
    HideShortcutTip()
    if transitioning {
        SetTimer(Advance,0)
        transitioning := false
    }
    idx += 1
    if idx > lesson.Length
        Complete()
    else
        StartSection(true)
}
Adjust(seconds) {
    global remain, duration
    remain := Max(0,remain+seconds*1000), duration := Max(1000,duration+seconds*1000)
    UpdateHUD()
}
Warning() {
    global timeTxt
    timeTxt.SetFont("s33 bold cB45309")
    try SoundPlay("*64")
    SetTimer((*) => timeTxt.SetFont("s33 bold c0F172A"), -900)
}
EndSection() {
    global transitioning, paused, hud
    if transitioning
        return
    transitioning := true, paused := true, hud.BackColor := "BFDBFE"
    try SoundPlay("*48")
    SetTimer(Advance,-1800)
}
Advance() {
    global idx, hud
    hud.BackColor := "EDEDED", idx += 1
    StartSection(true)
}
Finish() {
    if MsgBox("End this lesson?", "i-Teacher Timer", "YesNo Icon?") = "Yes"
        Complete()
}
Complete() {
    global paused, titleTxt, timeTxt, nextTxt, rail, statusTxt, hud
    paused := true
    titleTxt.SetFont("s11 bold", "Segoe UI")
    titleTxt.Value := "LESSON`nCOMPLETE"
    titleTxt.FullText := "LESSON`nCOMPLETE"
    timeTxt.SetFont("s28 bold", "Segoe UI")
    timeTxt.Value := "DONE"
    nextTxt.SetFont("s11 norm", "Segoe UI")
    nextTxt.Value := "Great work!"
    nextTxt.FullText := "Great work!"
    rail.Value := 100
    statusTxt.Value := "COMPLETE", hud.BackColor := "D1FAE5"
}
ToggleHUD() {
    global visible, hud
    visible := !visible
    if visible
        ShowHUD()
    else
        hud.Hide()
}
ToggleClicks() {
    global clickThrough, hud
    clickThrough := !clickThrough
    WinSetExStyle(clickThrough ? "+0x20" : "-0x20", "ahk_id " hud.Hwnd)
}
OpenLesson() {
    global hud, gx, gy
    WinGetPos(&gx,&gy,,,"ahk_id " hud.Hwnd)
    path := FileSelect(3,A_ScriptDir "\lessons","Choose lesson","Lesson plans (*.txt)")
    if path {
        LoadLesson(path)
        hud.BackColor := "EDEDED"
        ShowHUD()
    }
}
DragHUD(wParam,lParam,msg,hwnd) {
    global hud, clickThrough
    if (hwnd=hud.Hwnd && !clickThrough)
        return 2
}
