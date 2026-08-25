import Foundation
import AVFoundation

/* Mniejsza wersja wideo na telefony — bez ffmpeg, przez AVAssetExportSession. */
let src = URL(fileURLWithPath: CommandLine.arguments[1])
let dst = URL(fileURLWithPath: CommandLine.arguments[2])
let preset = CommandLine.arguments[3]
try? FileManager.default.removeItem(at: dst)

let asset = AVURLAsset(url: src)
guard let ex = AVAssetExportSession(asset: asset, presetName: preset) else {
    print("brak presetu"); exit(1)
}
ex.outputURL = dst
ex.outputFileType = .mp4
ex.shouldOptimizeForNetworkUse = true   // moov na początku pliku = szybszy start

let sem = DispatchSemaphore(value: 0)
ex.exportAsynchronously { sem.signal() }
sem.wait()

if ex.status == .completed {
    let n = (try? FileManager.default.attributesOfItem(atPath: dst.path)[.size] as? Int) ?? 0
    print("gotowe: \(dst.lastPathComponent) \((n ?? 0)/1024) KB")
} else {
    print("błąd: \(ex.error?.localizedDescription ?? "?")"); exit(1)
}
