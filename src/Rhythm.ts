import { TEXT_STYLE } from '../utils'
import { Progress } from './Progress'

export class Rhythm extends Phaser.Scene {
	song: string
	bpm: number
	blocks: Phaser.GameObjects.Group
	blockheight: number
	audio: Phaser.Sound.BaseSound
	cursors: Phaser.GameObjects.Sprite[]
	highscore: number
	scrore: number
	scoreText: Phaser.GameObjects.Text
	started: boolean
	tutorial: Phaser.GameObjects.Image
	constructor() {
		super('Rhythm')
	}
	init(data: { song: string }) {
		this.song = data.song
	}
	create() {
		const click = this.sound.add('click')
		click.setVolume(0.5)
		this.started = false
		this.cursors = []
		let progress = this.scene.get('Progress') as Progress
		progress.hideTinymon(true)
		let songData = this.cache.json.get(this.song) as SongData
		console.log(songData)
		this.highscore = songData.highscore
		this.scrore = 0
		this.bpm = songData.bpm
		let map = songData.map.slice()
		map.reverse()
		let songStarted = false
		let cols = map[0].length
		let blockWidth = 96 / cols
		let blockHeight = 32
		this.blockheight = blockHeight
		let top = map.length * blockHeight
		this.blocks = this.add.group()
		const colorMap: Record<string, number> = {
			'0': 0xde39e9,
			'1': 0xf792e4,
			'2': 0xde39e9,
			'3': 0xf792e4,
		}
		map.forEach((row, y) => {
			row.forEach((col, x) => {
				if (col === 1) {
					let block = this.add
						.rectangle(17 + x * blockWidth, -top + y * blockHeight, blockWidth, blockHeight, colorMap[x])
						.setOrigin(0, 0)
					block.width = blockWidth - 2
					block.setStrokeStyle(1, 0x000000)
					block.setData('active', true)
					this.blocks.add(block)
					this.physics.add.existing(block)
				}
			})
		})

		let winArea = this.add.rectangle(0, 120, 128, 10, 0xff0000).setOrigin(0).setZ(20)
		winArea.alpha = 0
		for (let i = 0; i < cols; i += 1) {
			let cursor = this.add
				.sprite(15 + i * blockWidth, 119, 'cursor')
				.setOrigin(0)
				.setZ(30)
			cursor.setData('pressed', false)
			this.physics.add.existing(cursor)
			this.cursors.push(cursor)
		}
		this.tutorial = this.add.image(0, 0, 'rhythm-bg-2').setOrigin(0).setZ(10)
		this.add.image(0, 0, 'rhythm-bg').setOrigin(0).setZ(10)
		this.audio = this.sound.add(this.song)
		this.physics.add.existing(winArea)
		this.physics.add.overlap(this.blocks, winArea, () => {
			if (!songStarted) {
				this.audio.play()
				songStarted = true
			}
		})
		this.audio.once('complete', () => {
			let score = this.add
				.text(64, 64, `${this.scrore}`, { ...TEXT_STYLE, fontSize: '11px' })
				.setZ(20)
				.setResolution(10)
				.setOrigin(0.5)
			this.add.tween({
				targets: score,
				scale: 2,
				duration: 1000,
				ease: 'Quad.easeInOut',
				yoyo: true,
				onComplete: () => {
					score.destroy()
				},
			})
			this.time.delayedCall(2000, () => {
				let win = false
				if (this.scrore >= this.highscore) {
					win = true
					progress.addTinymon()
				}
				progress.hideTinymon(false)
				this.scene.start('Game', {
					level: songData.spawn.map,
					x: songData.spawn.pos[0],
					y: songData.spawn.pos[1],
					dialog: win ? songData.dialogWin : songData.dialogLose,
				})
			})
		})
		this.add.text(128, 1, `HS:${this.highscore}`, TEXT_STYLE).setZ(20).setResolution(10).setOrigin(1, 0)
		this.scoreText = this.add
			.text(1, 1, `SCR:${this.scrore}`, TEXT_STYLE)
			.setZ(20)
			.setResolution(10)
			.setOrigin(0, 0)
		this.input.keyboard.on('keydown', (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				this.audio.stop()
				this.scene.start('Rhythm', { song: this.song })
			}
			if (event.key === ' ') {
				this.started = true
				this.tutorial.destroy()
			}
			let checkBlocks = this.blocks.children.entries.filter((block) => {
				return block.getData('active')
			})
			let checkCursor = (cursor: Phaser.GameObjects.Sprite) => {
				cursor.setFrame(1)
				if (this.physics.overlap(checkBlocks, cursor)) {
					click.play({ delay: 0 })
					let block = this.physics.closest(cursor, checkBlocks) as Phaser.GameObjects.Rectangle
					block.setData('active', false)
					block.fillColor = 0x2e1e5c
					cursor.tint = 0xf7faea
					this.scrore += 1
				} else {
					this.scrore -= 1
					cursor.tint = 0x120f28
					if (this.scrore < 0) {
						this.scrore = 0
					}
				}
			}
			if (event.key === 'h') {
				checkCursor(this.cursors[0])
			}
			if (event.key === 'j') {
				checkCursor(this.cursors[1])
			}
			if (event.key === 'k') {
				checkCursor(this.cursors[2])
			}
			if (event.key === 'l') {
				checkCursor(this.cursors[3])
			}
		})
		this.input.keyboard.on('keyup', (event: KeyboardEvent) => {
			if (event.key === 'h') {
				this.cursors[0].setFrame(0)
				this.cursors[0].tint = 0xffffff
			}
			if (event.key === 'j') {
				this.cursors[1].setFrame(0)
				this.cursors[1].tint = 0xffffff
			}
			if (event.key === 'k') {
				this.cursors[2].setFrame(0)
				this.cursors[2].tint = 0xffffff
			}
			if (event.key === 'l') {
				this.cursors[3].setFrame(0)
				this.cursors[3].tint = 0xffffff
			}
		})
	}
	update(_time: number, delta: number): void {
		if (!this.started) return
		this.scoreText.setText(`SCR:${this.scrore}`)
		this.blocks.children.entries.forEach((value: Phaser.GameObjects.GameObject) => {
			let block = value as Phaser.GameObjects.Rectangle
			block.y += (((delta / 1000) * this.bpm) / 60) * this.blockheight
			if (block.y > 128) {
				if (block.getData('active')) {
					this.scrore -= 1
					if (this.scrore < 0) {
						this.scrore = 0
					}
				}
				block.destroy()
			}
		})
	}
}
