import {
  _decorator,
  BoxCollider2D,
  Component,
  EPhysics2DDrawFlags,
  ERigidBody2DType,
  EventKeyboard,
  input,
  Input,
  instantiate,
  KeyCode,
  Node,
  PhysicsSystem2D,
  Prefab,
  randomRangeInt,
  RigidBody2D,
  SpriteFrame,
  TiledLayer,
  TiledMap,
  TiledTile,
  tween,
  UITransform,
  Vec2,
  Vec3,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("Main")
export class Main extends Component {
  @property({ type: Prefab })
  Tank: Prefab = null;

  @property({ type: Node })
  MAP: Node = null;

  @property({ type: Prefab })
  Bullet: Prefab = null;

  @property({ type: Prefab })
  Bricks: Node = null;

  @property({ type: Prefab })
  EnemyTank: Prefab = null;

  TankObject;
  EnemyTankPositioning;
  onLoad() {
    
  }

  Move(event: EventKeyboard) {
    // Gets the keycode for a key
    // console.log(event.keyCode);
    // Gets the down arrow key code
    // console.log(KeyCode.ARROW_DOWN);
    console.log("Key Pressed");
    switch (event.keyCode) {
      case KeyCode.ARROW_DOWN:
        console.log("Entered Down");

        this.TankObject.angle = 180;
        console.log(this.TankObject.angle);
        this.TankObject.setPosition(
          this.TankObject.getPosition().x,
          this.TankObject.getPosition().y - 20
        );
        break;

      case KeyCode.ARROW_UP:
        console.log("Entered up");
        this.TankObject.angle = 0;
        this.TankObject.setPosition(
          this.TankObject.getPosition().x,
          this.TankObject.getPosition().y + 20
        );
        break;

      case KeyCode.ARROW_RIGHT:
        console.log("Entered right");
        this.TankObject.angle = 270;
        this.TankObject.setPosition(
          this.TankObject.getPosition().x + 20,
          this.TankObject.getPosition().y
        );
        break;

      case KeyCode.ARROW_LEFT:
        console.log("Entered left");
        this.TankObject.angle = 90;
        this.TankObject.setPosition(
          this.TankObject.getPosition().x - 20,
          this.TankObject.getPosition().y
        );
        break;

      case KeyCode.SPACE:
        this.Fire();
        break;
    }
  }

  Fire() {
    const bullet = instantiate(this.Bullet);
    this.TankObject.addChild(bullet);
    bullet.setPosition(0, 0)
    // bullet.setPosition(
    //   this.TankObject.getPosition().x,
    //   this.TankObject.getPosition().y
    // );
    

    // const TankWorldSpace = this.node.convertToWorldSpaceAR(this.TankObject.getPosition())

    switch (bullet.angle) {
      case 0:
        console.log("Zero");
        tween(bullet)
          .by(0.3, {
            worldPosition: new Vec3(0, this.TankObject.getWorldPosition().y + 10, 0),
          })
          .repeatForever()
          .start();
        break;

      case 90:
        console.log("Ninty");
        bullet.angle = 90;
        tween(bullet)
          .by(0.3, {
            worldPosition: new Vec3(this.TankObject.getWorldPosition().x + 10, 0, 0),
          })
          .repeatForever()
          .start();
        break;
      
      case 180:
        console.log("One Eighty");
        
        
        tween(bullet)
          .by(0.3, {
            worldPosition: new Vec3(0, this.TankObject.getWorldPosition().y - 10, 0),
          })
          .repeatForever()
          .start();
        break;

      case 270:
        console.log("Two Hundred Seventy");
        tween(bullet)
          .by(0.3, {
            worldPosition: new Vec3(this.TankObject.getWorldPosition().x + 10, 0, 0),
          })
          .repeatForever()
          .start();
        break;
      
    }
  }

  CollisionWithBricks(name) {
    let Layer: TiledLayer = this.MAP.getComponent(TiledMap).getLayer(name);
    // Layer.getComponent(UITransform).setAnchorPoint(0, 0);
    // Layer.node.setPosition(
    //   -this.node.getPosition().x,
    //   -this.node.getPosition().y
    // );

    let TileSize = Layer.getMapTileSize();

    for (let i = 0; i < Layer.getLayerSize().width; i++) {
      for (let j = 0; j < Layer.getLayerSize().height; j++) {
        let tile: TiledTile = Layer.getTiledTileAt(i, j, true);
        if (tile.grid != 0) {
          tile.node.addComponent(RigidBody2D);
          tile.node.getComponent(RigidBody2D).type = ERigidBody2DType.Static;
          tile.node.getComponent(RigidBody2D).allowSleep = false;
          tile.node.getComponent(RigidBody2D).awakeOnLoad = true;
          tile.node.getComponent(RigidBody2D).gravityScale = 0;

          let collider = tile.addComponent(BoxCollider2D);
          collider.size = TileSize;
          collider.density = 1000;
          collider.restitution = 0;
          collider.offset = new Vec2(TileSize.width / 2, TileSize.height / 2);
          collider.apply();
        }
      }
    }
  }
  cnt = 0;
  enemyTankMovement(enemyTank) {}

  InstantiateEnemyTank() {
    this.cnt++;
    if(this.cnt < 4){
      const enemyTank = instantiate(this.EnemyTank);
      const Index = randomRangeInt(0, 3);

      enemyTank.setPosition(this.EnemyTankPositioning[Index][0], this.EnemyTankPositioning[Index][1]);

      this.node.addChild(enemyTank);
      this.enemyTankMovement(enemyTank);
    }else{
      this.unschedule(this.InstantiateEnemyTank)
    }
  }

  start() {
    // PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.All;
    this.MAP.getComponent(UITransform).setAnchorPoint(0,0)
    this.MAP.setWorldPosition(0,0,0)
    
    this.TankObject = instantiate(this.Tank);
    this.MAP.addChild(this.TankObject);
    this.TankObject.setSiblingIndex(this.MAP.children.length - 2);

    input.on(Input.EventType.KEY_DOWN, this.Move, this);
    input.on(Input.EventType.KEY_PRESSING, this.Move, this);

    this.CollisionWithBricks(this.Bricks.name);

    this.schedule(this.InstantiateEnemyTank, 1);

    this.EnemyTankPositioning = [
      [
        -this.node.getComponent(UITransform).width / 2 +
          this.TankObject.getComponent(UITransform).width / 2,
        this.node.getComponent(UITransform).height / 2 -
          this.TankObject.getComponent(UITransform).height / 2,
      ],
      [
        0,
        this.node.getComponent(UITransform).height / 2 -
          this.TankObject.getComponent(UITransform).height / 2,
      ],
      [
        this.node.getComponent(UITransform).width / 2 -
          this.TankObject.getComponent(UITransform).width / 2,
        this.node.getComponent(UITransform).height / 2 -
          this.TankObject.getComponent(UITransform).height / 2,
      ],
    ];
    
  }

  update(deltaTime: number) {}
}
