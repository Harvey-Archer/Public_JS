/*
================================================================================
    i-Teacher Timer V4.5
    A lightweight, always-on-top classroom timer for AutoHotkey v2.
    
    Features:
    - Dynamic text scaling for multi-line lesson parts
    - Compact 199x269 footprint with vertical progress rail
    - Safe-click interactive buttons (Info and Close)
    - Full UTF-8 support for lesson files
    - @reminder: custom alerts with full-screen red flashing display
    
    Hotkeys:
    - F8        : Start / Pause the timer / Dismiss @reminder
    - F9        : Skip to the next section (disabled during @reminder)
    - F10       : Add 2 minutes (disabled during @reminder)
    - F11       : Remove 2 minutes (disabled during @reminder)
    - F12       : End the lesson early
    - Ctrl+Alt+R: Restart current section
    - Ctrl+Alt+H: Show / Hide the timer HUD
    - Ctrl+Alt+C: Toggle click-through mode
    - Ctrl+Alt+O: Open a new lesson plan
    - Ctrl+MouseWheel / Ctrl+Plus/Minus: Scale UI dynamically
================================================================================
*/

#Requires AutoHotkey v2.0
#SingleInstance Force
#UseHook True
InstallKeybdHook
Persistent

global UI_Scale := 1.0
global UI_BaseW := 199, UI_BaseH := 269
global UI_W := UI_BaseW, UI_H := UI_BaseH
global ctrlBase := Map()

global lesson := [], idx := 1, remain := 0, duration := 0, lastTick := 0
global paused := true, transitioning := false, warned := false
global visible := true, clickThrough := false, gx := "", gy := ""
global tipVisible := false
global reminderBg := "", reminderTxt := "", flashTimerRunning := false, flashState := 0

AddScaledProgress(hudObj, bx, by, bw, bh, options, value) {
    global UI_Scale, ctrlBase
    x := Round(bx * UI_Scale), y := Round(by * UI_Scale), w := Round(bw * UI_Scale), h := Round(bh * UI_Scale)
    ctrl := hudObj.AddProgress("x" x " y" y " w" w " h" h " " options, value)
    ctrlBase[ctrl] := {x: bx, y: by, w: bw, h: bh, isText: false}
    return ctrl
}

AddScaledText(hudObj, bx, by, bw, bh, options, text, fontOptions, fontSize, fontFace) {
    global UI_Scale, ctrlBase
    x := Round(bx * UI_Scale), y := Round(by * UI_Scale), w := Round(bw * UI_Scale), h := Round(bh * UI_Scale)
    fs := Round(fontSize * UI_Scale)
    hudObj.SetFont("s" fs " " fontOptions, fontFace)
    ctrl := hudObj.AddText("x" x " y" y " w" w " h" h " " options, text)
    ctrlBase[ctrl] := {x: bx, y: by, w: bw, h: bh, isText: true, fs: fontSize, fo: fontOptions, ff: fontFace}
    return ctrl
}

global hud := Gui("+AlwaysOnTop -Caption +ToolWindow -DPIScale")
hud.BackColor := "EDEDED", hud.MarginX := 0, hud.MarginY := 0

global infoHud := Gui("+AlwaysOnTop -Caption +ToolWindow -DPIScale +E0x20 +Owner" hud.Hwnd)
infoHud.BackColor := "EDEDED"
infoHud.MarginX := 8, infoHud.MarginY := 8
infoHud.SetFont("s8 norm", "Segoe UI")
global infoHudText := infoHud.AddText("c111827", "F8   Pause / Dismiss`nF9   Next section`nF10  Add 2 minutes`nF11  Remove 2 minutes`nCtrl+Plus/Minus  Scale UI")

; Exact reference footprint: 199 x 269 physical pixels.
; Progress rail is now on the left and 300% wider than the previous 5 px rail.
global rail := AddScaledProgress(hud, 8, 26, 15, 182, "Vertical Range0-100 c2563EB BackgroundD1D5DB", 100)

global titleTxt := AddScaledText(hud, 31, 15, 158, 55, "Center c111827", "LESSON CUE TIMER", "bold", 11, "Segoe UI")
global timeTxt := AddScaledText(hud, 28, 75, 164, 65, "Center 0x200 c0F172A", "00:00", "bold", 33, "Segoe UI")
global nextTxt := AddScaledText(hud, 31, 155, 158, 55, "Center c334155", "-", "norm", 11, "Segoe UI")

global bottomRule := AddScaledProgress(hud, 31, 226, 158, 1, "Range0-100 cCBD5E1 BackgroundCBD5E1", 100)
global statusTxt := AddScaledText(hud, 31, 236, 109, 20, "Center 0x200 c1E3A8A", "PAUSED  1/1", "bold", 7, "Segoe UI")

global infoTxt := AddScaledText(hud, 140, 235, 20, 22, "Center 0x200 c2563EB", "ⓘ", "bold", 11, "Segoe UI Symbol")
infoTxt.OnEvent("Click", ToggleShortcutTip)

global closeTxt := AddScaledText(hud, 167, 234, 22, 22, "Center 0x200 cDC2626", "⨂", "bold", 12, "Segoe UI Symbol")
closeTxt.OnEvent("Click", (*) => ExitApp())

; Reminder overlay background (Progress control used for flashing without affecting footer)
global reminderBg := hud.AddProgress("x0 y0 w" UI_W " h" Round(226 * UI_Scale) " BackgroundDC2626 Hidden", 0)
ctrlBase[reminderBg] := {x: 0, y: 0, w: UI_BaseW, h: 226, isText: false, isReminderBg: true}

; Reminder text (no 0x200 so it wraps, manually centered vertically)
hud.SetFont("s18 bold", "Segoe UI")
global reminderTxt := hud.AddText("x0 y0 w" UI_W " h" Round(226 * UI_Scale) " Center BackgroundTrans cFFFFFF Hidden", "")
ctrlBase[reminderTxt] := {x: 0, y: 0, w: UI_BaseW, h: 226, isText: false, isReminderTxt: true}

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
    Hotkey("^NumpadAdd", (*) => ScaleUI(0.1), "On")
    Hotkey("^NumpadSub", (*) => ScaleUI(-0.1), "On")
    Hotkey("^=", (*) => ScaleUI(0.1), "On")
    Hotkey("^-", (*) => ScaleUI(-0.1), "On")
    
    ; Scaling Hotkeys (Ctrl+MouseWheel only active when hovering over HUD)
    HotIf (*) => WinActive("ahk_id " hud.Hwnd) || WinHover("ahk_id " hud.Hwnd)
    Hotkey("^WheelUp", (*) => ScaleUI(0.1), "On")
    Hotkey("^WheelDown", (*) => ScaleUI(-0.1), "On")
    HotIf
}

WinHover(hwnd) {
    MouseGetPos(,, &hoverWin)
    return hoverWin = hwnd
}

ScaleUI(delta) {
    global UI_Scale
    newScale := UI_Scale + delta
    if (newScale >= 0.5 && newScale <= 3.0) {
        UI_Scale := newScale
        ApplyScale()
    }
}

BuildTray() {
    A_TrayMenu.Delete()
    A_TrayMenu.Add("Start / Pause`tF8", (*) => TogglePause())
    A_TrayMenu.Add("Next section`tF9", (*) => NextSection())
    A_TrayMenu.Add("Add 2 minutes`tF10", (*) => Adjust(120))
    A_TrayMenu.Add("Remove 2 minutes`tF11", (*) => Adjust(-120))
    A_TrayMenu.Add()
    A_TrayMenu.Add("Restart current section`tCtrl+Alt+R", (*) => StartSection(true))
    A_TrayMenu.Add("Show / Hide HUD`tCtrl+Alt+H", (*) => ToggleHUD())
    A_TrayMenu.Add("Toggle click-through`tCtrl+Alt+C", (*) => ToggleClicks())
    A_TrayMenu.Add("Open lesson plan`tCtrl+Alt+O", (*) => OpenLesson())
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
        ; Check for @reminder: syntax before pipe-split parsing
        if (SubStr(line, 1, 10) = "@reminder:") {
            reminderText := Trim(SubStr(line, 11))
            if (reminderText = "")
                continue
            lesson.Push({name: reminderText, sec: 0, isReminder: true})
            continue
        }
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
    global lesson, idx, remain, duration, lastTick, paused, transitioning, warned, hud, reminderBg, reminderTxt, flashTimerRunning
    
    ; Clear transitioning state early so F8 (TogglePause) isn't permanently blocked during reminders
    transitioning := false
    
    if (idx > lesson.Length) {
        Complete()
        return
    }
    ; If this section is a @reminder, trigger the reminder display instead of timer mode
    if (lesson[idx].HasProp("isReminder") && lesson[idx].isReminder) {
        ShowReminder()
        return
    }
    ; Ensure reminder state is fully cleaned up when entering a normal section
    if (flashTimerRunning) {
        SetTimer(FlashReminder, 0)
        flashTimerRunning := false
    }
    hud.BackColor := "EDEDED"
    reminderBg.Visible := false
    reminderTxt.Visible := false
    EnsureStandardControlsVisible()
    duration := lesson[idx].sec*1000, remain := duration, warned := false
    paused := !run, lastTick := A_TickCount
    UpdateHUD()
}
Tick() {
    global paused, transitioning, remain, lastTick, warned, lesson, idx
    ; During a @reminder, pause all timer logic
    if (lesson[idx].HasProp("isReminder") && lesson[idx].isReminder)
        return
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
    global lesson, idx, remain, duration, paused, titleTxt, timeTxt, nextTxt, rail, statusTxt, UI_Scale
    if (idx < 1 || idx > lesson.Length)
        return
    ; During a @reminder, do not render standard timer UI
    if (lesson[idx].HasProp("isReminder") && lesson[idx].isReminder)
        return
    seconds := Ceil(Max(0,remain)/1000)
    
    wScaled := Round(158 * UI_Scale)
    hScaled := Round(55 * UI_Scale)
    
    titleStr := StrUpper(lesson[idx].name)
    if (!titleTxt.HasProp("FullText") || titleTxt.FullText != titleStr) {
        finalText := ""
        maxS := Round(11 * UI_Scale)
        minS := Round(7 * UI_Scale)
        titleSize := GetOptimalFontSize(titleStr, wScaled, hScaled, maxS, minS, "bold", &finalText)
        titleTxt.SetFont("s" titleSize " bold", "Segoe UI")
        titleTxt.Value := finalText
        titleTxt.FullText := titleStr
        titleTxt.ScaledSize := titleSize
    }

    nextName := idx < lesson.Length ? lesson[idx+1].name : "Finish lesson"
    if (!nextTxt.HasProp("FullText") || nextTxt.FullText != nextName) {
        finalNext := ""
        maxS := Round(11 * UI_Scale)
        minS := Round(7 * UI_Scale)
        nextSize := GetOptimalFontSize(nextName, wScaled, hScaled, maxS, minS, "norm", &finalNext)
        nextTxt.SetFont("s" nextSize " norm", "Segoe UI")
        nextTxt.Value := finalNext
        nextTxt.FullText := nextName
        nextTxt.ScaledSize := nextSize
    }

    timeTxt.Value := Format("{:02}:{:02}", Floor(seconds/60), Mod(seconds,60))
    rail.Value := Max(0, Min(100, Round(remain/duration*100)))
    statusTxt.Value := (paused ? "PAUSED" : "RUNNING") "  " idx "/" lesson.Length
}

GetOptimalFontSize(text, w, maxH, maxS, minS, fontOptions, &outText, &outH_val := 0) {
    outText := text
    size := maxS
    Loop {
        tempGui := Gui("-DPIScale")
        tempGui.SetFont("s" size " " fontOptions, "Segoe UI")
        
        ; 1. Check if any single word is wider than the allowed width 'w'
        widestLineTest := RegExReplace(outText, "[ \n\r]+", "`n")
        wordTxt := tempGui.AddText("", widestLineTest)
        wordTxt.GetPos(,, &wordW, &wordH)
        
        ; 2. Check if the wrapped text fits within the allowed height 'maxH'
        tempTxt := tempGui.AddText("w" w, outText)
        tempTxt.GetPos(,, &outW, &outH)
        tempGui.Destroy()
        
        if (wordW <= w && outH <= maxH) {
            outH_val := outH
            return size
        }
            
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
        
        widestLineTest := RegExReplace(outText, "[ \n\r]+", "`n")
        wordTxt := tempGui.AddText("", widestLineTest)
        wordTxt.GetPos(,, &wordW, &wordH)
        
        tempTxt := tempGui.AddText("w" w, outText)
        tempTxt.GetPos(,, &outW, &outH)
        tempGui.Destroy()
        
        if ((wordW <= w && outH <= maxH) || StrLen(baseText) < 2) {
            outH_val := outH
            return minS
        }
    }
}

ApplyScale() {
    global hud, infoHud, infoHudText, tipVisible, UI_Scale, UI_BaseW, UI_BaseH, UI_W, UI_H, ctrlBase, reminderBg, reminderTxt, lesson, idx
    
    UI_W := Round(UI_BaseW * UI_Scale)
    UI_H := Round(UI_BaseH * UI_Scale)
    hud.Move(,, UI_W, UI_H)
    
    infoHud.Destroy()
    infoHud := Gui("+AlwaysOnTop -Caption +ToolWindow -DPIScale +E0x20 +Owner" hud.Hwnd)
    infoHud.BackColor := "EDEDED"
    infoHud.MarginX := Round(8 * UI_Scale), infoHud.MarginY := Round(8 * UI_Scale)
    infoHud.SetFont("s" Round(8 * UI_Scale) " norm", "Segoe UI")
    infoHudText := infoHud.AddText("c111827", "F8   Pause / Dismiss`nF9   Next section`nF10  Add 2 minutes`nF11  Remove 2 minutes`nCtrl+Plus/Minus  Scale UI")
    tipVisible := false
    
    for ctrl, b in ctrlBase {
        if (b.HasProp("isReminderBg") && b.isReminderBg) {
            remH := Round(226 * UI_Scale)
            ctrl.Move(0, 0, UI_W, remH)
            continue
        }
        if (b.HasProp("isReminderTxt") && b.isReminderTxt) {
            remH := Round(226 * UI_Scale)
            ; If a reminder is currently displayed, recalculate font for new scale
            if (ctrl.Visible && idx >= 1 && idx <= lesson.Length && lesson[idx].HasProp("isReminder") && lesson[idx].isReminder) {
                reminderMsg := StrUpper(lesson[idx].name)
                finalReminder := ""
                maxS := Round(24 * UI_Scale)
                minS := Round(12 * UI_Scale)
                padding := Round(16 * UI_Scale)
                textW := UI_W - padding * 2
                textH := remH - padding
                finalH := 0
                reminderSize := GetOptimalFontSize(reminderMsg, textW, textH, maxS, minS, "bold", &finalReminder, &finalH)
                ctrl.SetFont("s" reminderSize " bold cFFFFFF", "Segoe UI")
                ctrl.Value := finalReminder
                yOff := (remH - finalH) / 2
                ctrl.Move(padding, yOff, textW, finalH)
            }
            continue
        }
        nx := Round(b.x * UI_Scale), ny := Round(b.y * UI_Scale), nw := Round(b.w * UI_Scale), nh := Round(b.h * UI_Scale)
        ctrl.Move(nx, ny, nw, nh)
        if b.isText {
            ; Check if it has a dynamic scaled size (titleTxt, nextTxt)
            if (ctrl.HasProp("ScaledSize")) {
                ctrl.FullText := ""
            } else {
                nfs := Round(b.fs * UI_Scale)
                ctrl.SetFont("s" nfs " " b.fo, b.ff)
            }
        }
    }
    UpdateHUD()
}

ToggleShortcutTip(*) {
    global tipVisible, hud, infoHud, UI_Scale
    if tipVisible {
        HideShortcutTip()
        return
    }
    
    ; Show it hidden first to recalculate its dimensions if scaled
    infoHud.Show("Hide")
    hud.GetPos(&hx, &hy, &hw, &hh)
    infoHud.GetPos(,, &iw, &ih)
    
    ; Snap to the left of the main HUD
    ix := hx - iw - Round(4 * UI_Scale)
    iy := hy + hh - ih
    
    infoHud.Show("x" ix " y" iy " NoActivate")
    
    tipVisible := true
    SetTimer(HideShortcutTip, -6000)
}

HideShortcutTip() {
    global tipVisible, infoHud
    infoHud.Hide()
    tipVisible := false
}
TogglePause() {
    global paused, transitioning, lastTick, lesson, idx
    if transitioning
        return
    ; F8 dismisses @reminder — no timer to pause
    if (lesson[idx].HasProp("isReminder") && lesson[idx].isReminder) {
        DismissReminder()
        return
    }
    paused := !paused, lastTick := A_TickCount
    HideShortcutTip()
    UpdateHUD()
}
NextSection() {
    global idx, lesson, transitioning
    HideShortcutTip()
    ; F9 is disabled during @reminder — use F8 to dismiss
    if (lesson[idx].HasProp("isReminder") && lesson[idx].isReminder)
        return
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
    global remain, duration, lesson, idx
    ; Disable time adjustment during @reminder — no timer to adjust
    if (lesson[idx].HasProp("isReminder") && lesson[idx].isReminder)
        return
    remain := Max(0,remain+seconds*1000), duration := Max(1000,duration+seconds*1000)
    UpdateHUD()
}
Warning() {
    global timeTxt, UI_Scale
    fs := Round(33 * UI_Scale)
    timeTxt.SetFont("s" fs " bold cB45309")
    try SoundPlay("*64")
    SetTimer((*) => timeTxt.SetFont("s" fs " bold c0F172A"), -900)
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
    global paused, titleTxt, timeTxt, nextTxt, rail, statusTxt, hud, UI_Scale, flashTimerRunning, reminderBg, reminderTxt
    ; Clean up any active flash timer from a @reminder
    if (flashTimerRunning) {
        SetTimer(FlashReminder, 0)
        flashTimerRunning := false
    }
    reminderBg.Visible := false
    reminderTxt.Visible := false
    EnsureStandardControlsVisible()
    paused := true
    hud.BackColor := "D1FAE5"
    fsTitle := Round(11 * UI_Scale)
    titleTxt.SetFont("s" fsTitle " bold", "Segoe UI")
    titleTxt.Value := "LESSON`nCOMPLETE"
    titleTxt.FullText := "LESSON`nCOMPLETE"
    titleTxt.ScaledSize := fsTitle
    
    fsTime := Round(28 * UI_Scale)
    timeTxt.SetFont("s" fsTime " bold", "Segoe UI")
    timeTxt.Value := "DONE"
    
    fsNext := Round(11 * UI_Scale)
    nextTxt.SetFont("s" fsNext " norm", "Segoe UI")
    nextTxt.Value := "Great work!"
    nextTxt.FullText := "Great work!"
    nextTxt.ScaledSize := fsNext
    
    rail.Value := 100
    statusTxt.Value := "COMPLETE"
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
    if (hwnd=hud.Hwnd && !clickThrough) {
        HideShortcutTip()
        return 2
    }
}

; =====================================================================
;  @reminder: Feature — Full-screen alert display with red flashing
; =====================================================================

ShowReminder() {
    global lesson, idx, reminderBg, reminderTxt, hud, titleTxt, timeTxt, nextTxt, rail, bottomRule, statusTxt, paused, flashTimerRunning, flashState, UI_Scale, UI_W, UI_H
    
    paused := true
    
    ; Hide standard timer elements (keep infoTxt, closeTxt, statusTxt visible)
    titleTxt.Visible := false
    timeTxt.Visible := false
    nextTxt.Visible := false
    rail.Visible := false
    bottomRule.Visible := false
    
    ; Show status as REMINDER
    statusTxt.Value := "REMINDER  " idx "/" lesson.Length
    
    ; Size the reminder text to fill the area above the footer using dynamic font scaling
    reminderMsg := StrUpper(lesson[idx].name)
    finalReminder := ""
    maxS := Round(24 * UI_Scale)
    minS := Round(12 * UI_Scale)
    padding := Round(16 * UI_Scale)
    textW := UI_W - padding * 2
    remH := Round(226 * UI_Scale)
    textH := remH - padding  ; stop above footer
    
    finalH := 0
    reminderSize := GetOptimalFontSize(reminderMsg, textW, textH, maxS, minS, "bold", &finalReminder, &finalH)
    reminderTxt.SetFont("s" reminderSize " bold cFFFFFF", "Segoe UI")
    reminderTxt.Value := finalReminder
    
    yOff := (remH - finalH) / 2
    reminderTxt.Move(padding, yOff, textW, finalH)
    
    reminderBg.Opt("BackgroundDC2626")
    reminderBg.Move(0, 0, UI_W, remH)
    
    reminderBg.Visible := true
    reminderTxt.Visible := true
    reminderTxt.Redraw()
    
    ; Start flashing effect (using reminderBg, NOT hud.BackColor)
    flashState := 0
    flashTimerRunning := true
    SetTimer(FlashReminder, 500)
    
    try SoundPlay("*64")
}

DismissReminder() {
    global flashTimerRunning, idx, hud, reminderBg, reminderTxt, lesson
    ; Stop flashing and restore UI, then advance to next section
    if (flashTimerRunning) {
        SetTimer(FlashReminder, 0)
        flashTimerRunning := false
    }
    reminderBg.Visible := false
    reminderTxt.Visible := false
    EnsureStandardControlsVisible()
    idx += 1
    if (idx > lesson.Length)
        Complete()
    else
        StartSection(true)
}

FlashReminder() {
    global reminderBg, flashState, reminderTxt
    ; Toggle reminderBg between red and light red for attention-grabbing effect
    flashState := !flashState
    if (flashState)
        reminderBg.Opt("BackgroundFEE2E2")
    else
        reminderBg.Opt("BackgroundDC2626")
    
    ; Changing Progress options causes it to paint over transparent text controls.
    ; Force the text control to redraw itself on top.
    reminderTxt.Redraw()
}

EnsureStandardControlsVisible() {
    global titleTxt, timeTxt, nextTxt, rail, bottomRule
    titleTxt.Visible := true
    timeTxt.Visible := true
    nextTxt.Visible := true
    rail.Visible := true
    bottomRule.Visible := true
}