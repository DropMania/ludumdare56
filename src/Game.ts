import Phaser from 'phaser'
import Player from './Player'
import npcs from '../npcs'
import { Progress } from './Progress'
export class Game extends Phaser.Scene {
	level: string
	map: Phaser.Tilemaps.Tilemap
	collisionLayer: Phaser.Tilemaps.TilemapLayer
	player: Player
	entrances: Phaser.GameObjects.Group
	isExiting: boolean
	npcs: Phaser.GameObjects.Group
	progress: Progress
	inDialog: boolean
	inRhythm: boolean
	startPos: { x: number; y: number }
	startDialog: string[]
	audio: Phaser.Sound.BaseSound
	keys: {
		W: Phaser.Input.Keyboard.Key
		A: Phaser.Input.Keyboard.Key
		S: Phaser.Input.Keyboard.Key
		D: Phaser.Input.Keyboard.Key
	}
	constructor() {
		super('Game')
	}
	init({ level, x, y, dialog }: { level: string; x: number; y: number; dialog: string[] }) {
		this.level = level
		this.startPos = { x, y }
		this.startDialog = dialog
	}
	create() {
		this.progress = this.scene.get('Progress') as Progress
		this.keys = this.input.keyboard!.addKeys('W,A,S,D') as {
			W: Phaser.Input.Keyboard.Key
			A: Phaser.Input.Keyboard.Key
			S: Phaser.Input.Keyboard.Key
			D: Phaser.Input.Keyboard.Key
		}
		this.audio = this.sound.add(this.level == 'world1' ? 'overworld' : 'comfy')
		this.audio.play({ loop: true, volume: 0.5 })
		this.npcs = this.add.group()
		this.entrances = this.add.group()
		this.map = this.make.tilemap({ key: this.level })
		this.isExiting = false
		this.inDialog = false
		this.inRhythm = false
		const tileset = this.map.addTilesetImage('tiles', 'tileset')
		this.collisionLayer = this.map.createLayer('Collision', tileset)
		this.collisionLayer.setCollision([57])
		this.collisionLayer.alpha = 0
		this.map.createLayer('Ground', tileset)
		const objectLayer = this.map.getObjectLayer('Objects')
		objectLayer.objects.forEach((obj) => {
			let props = {} as { [key: string]: any }
			if (obj.properties) {
				obj.properties.forEach((prop: { name: string; value: any }) => {
					props[prop.name] = prop.value
				})
			}
			if (obj.name === 'Player') {
				this.player = new Player(this, this.startPos.x || obj.x, this.startPos.y || obj.y)
			}
			if (obj.name === 'Entrance') {
				const entrance = this.add.rectangle(obj.x, obj.y, obj.width, obj.height, 0xff000000).setOrigin(0)
				entrance.alpha = 0
				entrance.setSize(obj.width, obj.height)
				entrance.setData('Level', props.level)
				entrance.setData('requires', props.requires || 0)
				let pos = props.pos ? props.pos.split('|') : null
				entrance.setData('pos', pos)
				this.physics.add.existing(entrance)
				this.entrances.add(entrance)
			}
			if (obj.name === 'NPC') {
				let npcConf = npcs[props.name]
				const npc = this.add.sprite(obj.x, obj.y, props.name)
				npc.play({ key: `${props.name}_idle`, repeat: -1 })
				npc.setOrigin(0, 0)
				npc.setData('song', npcConf.song)
				npc.setData('dialog', npcConf.dialog)
				this.physics.add.existing(npc)
				this.npcs.add(npc)
			}
		})
		this.map.createLayer('Top', tileset)!
		if (this.level === 'world1' && this.progress.creatures.length < 5) {
			let blockade = this.add.image(288, 112, 'blockade').setOrigin(0)
			this.physics.add.existing(blockade, true)
			this.physics.add.collider(this.player, blockade)
		}
		this.physics.add.collider(this.player, this.collisionLayer)
		this.physics.add.overlap(this.player, this.entrances, (_player, entrance) => {
			this.enterEntrance(entrance as Phaser.GameObjects.Rectangle)
		})
		this.physics.add.overlap(this.player, this.npcs, async (_player, npc) => {
			if (this.inDialog) {
				return
			}
			this.inDialog = true
			await this.progress.showDialog((npc as Phaser.GameObjects.Sprite).getData('dialog'))
			this.inDialog = false
			this.startRhythm((npc as Phaser.GameObjects.Sprite).getData('song'))
		})
		this.cameras.main.fadeIn(500)
		this.cameras.main.startFollow(this.player)
		this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
		if (this.startDialog) {
			this.inDialog = true
			this.progress.showDialog(this.startDialog).then(() => {
				this.inDialog = false
				if (this.progress.creatures.length === 6) {
					this.audio.stop()
					this.scene.start('Credits')
				}
			})
		}
	}
	startRhythm(song: string) {
		this.audio.stop()
		this.scene.start('Rhythm', { song })
	}
	async enterEntrance(entrance: Phaser.GameObjects.Rectangle) {
		if (this.isExiting) {
			return
		}
		let requires = entrance.getData('requires')
		if (requires > this.progress.creatures.length) {
			this.inDialog = true
			await this.progress.showDialog([`You need ${requires} Tinymon`, 'to pass!'])
			this.inDialog = false
			this.player.setY(this.player.y + 0.3)
			return
		}
		this.audio.stop()
		this.isExiting = true
		this.cameras.main.fadeOut(500)
		this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
			let pos = entrance.getData('pos')
			let data: any = { level: entrance.getData('Level') }
			if (pos) {
				data.x = parseInt(pos[0])
				data.y = parseInt(pos[1])
			}
			this.scene.start('Game', data)
		})
	}
	update() {
		if (this.isExiting || this.inDialog || this.inRhythm) return this.player.setVelocity(0)
		this.player.update()
	}
}
