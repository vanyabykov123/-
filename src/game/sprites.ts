// Sprites and Avatar Canvas Renderers
// Renders the Hero Girl in Blue Dress, Enemy Man in Blue Suit, and Win Transformation

export interface CustomPhotos {
  heroFaceUrl?: string;
  enemyFaceUrl?: string;
  friendsPhotoUrl?: string;
}

export class SpriteRenderer {
  private customImages: Map<string, HTMLImageElement> = new Map();

  constructor() {
    // Pre-load realistic friends photo SVG by default
    const defaultFriendsImg = new Image();
    defaultFriendsImg.src = '/friends_photo.svg';
    defaultFriendsImg.onload = () => {
      if (!this.customImages.has('friendsPhoto')) {
        this.customImages.set('friendsPhoto', defaultFriendsImg);
      }
    };
  }

  public setCustomImage(key: string, dataUrl: string) {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      this.customImages.set(key, img);
    };
  }

  public drawHero(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    facing: 'left' | 'right',
    animFrame: number,
    isJumping: boolean,
    isSuit: boolean = false,
    isDancing: boolean = false,
    isInvincible: boolean = false
  ) {
    ctx.save();
    if (isInvincible && Math.sin(animFrame * 14) > 0) {
      ctx.globalAlpha = 0.35;
    }
    const danceBounce = isDancing ? Math.abs(Math.sin(animFrame * 0.8)) * 14 : 0;
    const danceTilt = isDancing ? Math.sin(animFrame * 0.8) * 0.12 : 0;

    ctx.translate(x + width / 2, y + height - danceBounce);
    if (facing === 'left') {
      ctx.scale(-1, 1);
    }
    if (isDancing) {
      ctx.rotate(danceTilt);
    }

    const walkOffset = isJumping ? -4 : (isDancing ? Math.sin(animFrame * 0.8) * 4 : Math.sin(animFrame * 0.4) * 3);
    const legSwing = isJumping ? 8 : (isDancing ? Math.sin(animFrame * 0.8) * 8 : Math.sin(animFrame * 0.4) * 6);

    // --- LEGS & SHOES ---
    ctx.fillStyle = isSuit ? '#0f172a' : '#fbcfe8'; // Pants or Tights
    ctx.fillRect(-10, -12, 6, 12 + (isJumping ? -2 : legSwing));
    ctx.fillRect(4, -12, 6, 12 - (isJumping ? 2 : legSwing));

    // Shoes
    ctx.fillStyle = isSuit ? '#1e293b' : '#1e1b4b'; // Sleek heels / dress shoes
    ctx.beginPath();
    ctx.roundRect(-12, -2 + (isJumping ? -2 : legSwing), 10, 4, 2);
    ctx.roundRect(2, -2 - (isJumping ? 2 : legSwing), 10, 4, 2);
    ctx.fill();

    // --- BODY / DRESS or SUIT ---
    if (!isSuit) {
      // Midnight Blue Dress (from 85Im83jNCpo.jpg)
      ctx.fillStyle = '#161e38'; // Deep royal navy
      ctx.beginPath();
      // Flowing dress skirt
      ctx.moveTo(-12, -22);
      ctx.lineTo(12, -22);
      ctx.lineTo(16 + (walkOffset * 0.5), -12);
      ctx.lineTo(-16 - (walkOffset * 0.5), -12);
      ctx.closePath();
      ctx.fill();

      // Dress bodice
      ctx.fillStyle = '#1e294f';
      ctx.beginPath();
      ctx.moveTo(-11, -34);
      ctx.lineTo(11, -34);
      ctx.lineTo(12, -22);
      ctx.lineTo(-12, -22);
      ctx.closePath();
      ctx.fill();

      // Elegant V-neckline fold
      ctx.fillStyle = '#263366';
      ctx.beginPath();
      ctx.moveTo(-11, -34);
      ctx.lineTo(0, -26);
      ctx.lineTo(11, -34);
      ctx.stroke();

      // Blue Rosette Ribbon Badge (pinned on lapel from photo!)
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(6, -30, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#93c5fd';
      ctx.beginPath();
      ctx.arc(6, -30, 2.5, 0, Math.PI * 2);
      ctx.fill();
      // Ribbon tails
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(4, -27);
      ctx.lineTo(3, -22);
      ctx.moveTo(8, -27);
      ctx.lineTo(9, -22);
      ctx.stroke();

      // Bare shoulders / necklace
      ctx.fillStyle = '#fed7aa'; // Neck
      ctx.fillRect(-4, -38, 8, 5);
      // Pearl necklace
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -32, 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // STRICT BUSINESS SUIT (Finale transformation)
      // Blazer
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-13, -34, 26, 22);

      // White Shirt & Lapels
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-5, -34);
      ctx.lineTo(0, -22);
      ctx.lineTo(5, -34);
      ctx.closePath();
      ctx.fill();

      // Red or Gold Birthday Tie
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(-2, -32);
      ctx.lineTo(2, -32);
      ctx.lineTo(3, -20);
      ctx.lineTo(0, -17);
      ctx.lineTo(-3, -20);
      ctx.closePath();
      ctx.fill();

      // Gold celebratory lapel pin "30"
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(-8, -30, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- ARMS ---
    ctx.fillStyle = isSuit ? '#0f172a' : '#fed7aa';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;

    if (isDancing) {
      // Arms raised high waving in dance!
      const leftArmAngle = -0.9 + Math.sin(animFrame * 0.8) * 0.35;
      const rightArmAngle = 0.9 - Math.cos(animFrame * 0.8) * 0.35;

      // Left Arm
      ctx.save();
      ctx.translate(-12, -32);
      ctx.rotate(leftArmAngle);
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-2.5, -20, 6, 20, 2.5);
      ctx.fill();
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(0.5, -22, 3.5, 0, Math.PI * 2);
      ctx.fill();
      // Sparkler
      ctx.fillStyle = '#fde047';
      ctx.font = '12px sans-serif';
      ctx.fillText('✨', -4, -26);
      ctx.restore();

      // Right Arm
      ctx.save();
      ctx.translate(12, -32);
      ctx.rotate(rightArmAngle);
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-2.5, -20, 6, 20, 2.5);
      ctx.fill();
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(0.5, -22, 3.5, 0, Math.PI * 2);
      ctx.fill();
      // Champagne glass / cheer
      ctx.fillStyle = '#fde047';
      ctx.font = '12px sans-serif';
      ctx.fillText('🥂', -4, -26);
      ctx.restore();
    } else {
      // Left & Right Arm swinging with motion
      ctx.beginPath();
      ctx.roundRect(-15, -32, 5, 14, 2);
      ctx.roundRect(10, -32, 5, 14, 2);
      ctx.fill();
    }

    // --- HEAD & FACE ---
    const customHeroFace = this.customImages.get('heroFace');
    const faceCenterY = -48;

    if (customHeroFace) {
      // Render user custom photo face inside a polished circular portrait
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, faceCenterY, 13, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(customHeroFace, -13, faceCenterY - 13, 26, 26);
      ctx.restore();
      // Ring border
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, faceCenterY, 13, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Stylized portrait matching photo 2:
      // Elegant blonde bun / updo hairstyle
      ctx.fillStyle = '#fde047'; // Warm golden blonde
      // High bun on top
      ctx.beginPath();
      ctx.arc(0, faceCenterY - 10, 8, 0, Math.PI * 2);
      ctx.fill();

      // Hair background/sides
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(0, faceCenterY - 2, 12, 0, Math.PI * 2);
      ctx.fill();

      // Face skin
      ctx.fillStyle = '#ffedd5';
      ctx.beginPath();
      ctx.arc(0, faceCenterY, 9.5, 0, Math.PI * 2);
      ctx.fill();

      // Blonde bangs & side strands
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(-10, faceCenterY - 6);
      ctx.quadraticCurveTo(-4, faceCenterY - 1, 0, faceCenterY - 6);
      ctx.quadraticCurveTo(5, faceCenterY - 3, 9, faceCenterY - 6);
      ctx.lineTo(8, faceCenterY - 10);
      ctx.lineTo(-8, faceCenterY - 10);
      ctx.closePath();
      ctx.fill();

      // Side tendrils framing face
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-8, faceCenterY - 2);
      ctx.lineTo(-10, faceCenterY + 5);
      ctx.moveTo(8, faceCenterY - 2);
      ctx.lineTo(10, faceCenterY + 4);
      ctx.stroke();

      // Eyes (sparkling blue)
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.arc(-3.5, faceCenterY - 1, 1.8, 0, Math.PI * 2);
      ctx.arc(3.5, faceCenterY - 1, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Eye highlights
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-4, faceCenterY - 2, 1, 1);
      ctx.fillRect(3, faceCenterY - 2, 1, 1);

      // Rosy cheeks
      ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
      ctx.beginPath();
      ctx.arc(-5.5, faceCenterY + 3, 2, 0, Math.PI * 2);
      ctx.arc(5.5, faceCenterY + 3, 2, 0, Math.PI * 2);
      ctx.fill();

      // Radiant smile
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(0, faceCenterY + 2, 3.5, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();

      // If in business suit: optional cool boss sunglasses!
      if (isSuit) {
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(-8, faceCenterY - 4, 7, 5, 1.5);
        ctx.roundRect(1, faceCenterY - 4, 7, 5, 1.5);
        ctx.fill();
        // Bridge
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-1, faceCenterY - 2);
        ctx.lineTo(1, faceCenterY - 2);
        ctx.stroke();
        // Glare on sunglasses
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-6, faceCenterY - 3);
        ctx.lineTo(-3, faceCenterY);
        ctx.moveTo(3, faceCenterY - 3);
        ctx.lineTo(6, faceCenterY);
        ctx.stroke();
      }
    }

    // Party Crown or birthday sparkle
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(-6, faceCenterY - 15);
    ctx.lineTo(-3, faceCenterY - 21);
    ctx.lineTo(0, faceCenterY - 17);
    ctx.lineTo(3, faceCenterY - 21);
    ctx.lineTo(6, faceCenterY - 15);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Draw Enemy (Guy in Blue Suit with Hand Outstretched from x_bf3ce3e9.jpg)
  public drawEnemy(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    facing: 'left' | 'right',
    animFrame: number,
    isSquashed: boolean = false
  ) {
    ctx.save();
    ctx.translate(x + width / 2, y + height);
    if (facing === 'right') {
      ctx.scale(-1, 1);
    }

    if (isSquashed) {
      // Flattened enemy animation on stomp
      ctx.scale(1.4, 0.25);
    }

    const walkSwing = Math.sin(animFrame * 0.4) * 4;

    // --- TROUSERS & SHOES ---
    ctx.fillStyle = '#1e2530'; // Dark pinstripe pants
    ctx.fillRect(-9, -10, 6, 10 + walkSwing);
    ctx.fillRect(3, -10, 6, 10 - walkSwing);

    ctx.fillStyle = '#0f172a'; // Black dress shoes
    ctx.fillRect(-11, -2 + walkSwing, 9, 3);
    ctx.fillRect(2, -2 - walkSwing, 9, 3);

    // --- DARK BLUE PINSTRIPE SUIT JACKET ---
    ctx.fillStyle = '#1a2233'; // Pinstripe suit
    ctx.beginPath();
    ctx.roundRect(-13, -30, 26, 21, 2);
    ctx.fill();

    // Subtle pinstripes
    ctx.strokeStyle = '#28344d';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-8, -29); ctx.lineTo(-8, -10);
    ctx.moveTo(-3, -29); ctx.lineTo(-3, -10);
    ctx.moveTo(3, -29); ctx.lineTo(3, -10);
    ctx.moveTo(8, -29); ctx.lineTo(8, -10);
    ctx.stroke();

    // White Shirt collar & V-lapel
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-5, -30);
    ctx.lineTo(0, -18);
    ctx.lineTo(5, -30);
    ctx.closePath();
    ctx.fill();

    // BLUE PATTERNED TIE (from photo!)
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.moveTo(-3, -28);
    ctx.lineTo(3, -28);
    ctx.lineTo(2, -16);
    ctx.lineTo(0, -13);
    ctx.lineTo(-2, -16);
    ctx.closePath();
    ctx.fill();

    // Tie pattern checks
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(-1.5, -24, 3, 2);
    ctx.fillRect(-1.5, -19, 3, 2);

    // Left arm hanging back
    ctx.fillStyle = '#1a2233';
    ctx.beginPath();
    ctx.roundRect(8, -28, 5, 14, 2);
    ctx.fill();

    // --- OUTSTRETCHED HAND REACHING TOWARD CAMERA (Iconic photo pose!) ---
    // Right arm reaching forward
    ctx.save();
    ctx.translate(-8, -22);
    ctx.rotate(-0.15 + Math.sin(animFrame * 0.3) * 0.08);

    // Arm sleeve in perspective
    ctx.fillStyle = '#1a2233';
    ctx.beginPath();
    ctx.moveTo(-2, -3);
    ctx.lineTo(-12, -8);
    ctx.lineTo(-14, 2);
    ctx.lineTo(-2, 5);
    ctx.closePath();
    ctx.fill();

    // White shirt cuff
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-14, -6, 3, 7);

    // Big reaching hand in forced perspective!
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(-18, -2, 6, 0, Math.PI * 2);
    ctx.fill();

    // Spread fingers reaching out
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    // Thumb
    ctx.roundRect(-22, -9, 4, 6, 1.5);
    // Index
    ctx.roundRect(-25, -5, 7, 3.5, 1);
    // Middle
    ctx.roundRect(-26, -1.5, 8, 3.5, 1);
    // Ring
    ctx.roundRect(-25, 2, 7, 3.5, 1);
    // Pinky
    ctx.roundRect(-23, 5, 5, 3, 1);
    ctx.fill();
    ctx.restore();

    // --- HEAD & FACE ---
    const customEnemyFace = this.customImages.get('enemyFace');
    const faceCenterY = -42;

    if (customEnemyFace) {
      // User photo face
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, faceCenterY, 12, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(customEnemyFace, -12, faceCenterY - 12, 24, 24);
      ctx.restore();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, faceCenterY, 12, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Stylized boyish face from photo 1
      // Brown short hair with bangs combed slightly forward
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(0, faceCenterY - 2, 11, Math.PI * 0.8, Math.PI * 2.2);
      ctx.fill();

      // Face skin
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(0, faceCenterY, 8.5, 0, Math.PI * 2);
      ctx.fill();

      // Bangs
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.moveTo(-8, faceCenterY - 6);
      ctx.lineTo(-4, faceCenterY - 2);
      ctx.lineTo(0, faceCenterY - 5);
      ctx.lineTo(4, faceCenterY - 2);
      ctx.lineTo(8, faceCenterY - 6);
      ctx.lineTo(6, faceCenterY - 10);
      ctx.lineTo(-6, faceCenterY - 10);
      ctx.closePath();
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-4, faceCenterY - 1, 2.2, 2.2);
      ctx.fillRect(2, faceCenterY - 1, 2.2, 2.2);

      // Smirking smile
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0.5, faceCenterY + 2.5, 3, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Draw Castle & Friends finish line banner (Photo 3 with 4 friends, Flagpole, and Dancing)
  public drawFinishCelebration(
    ctx: CanvasRenderingContext2D,
    x: number,
    groundY: number,
    flagProgress: number = 0,
    isDancing: boolean = false,
    animFrame: number = 0
  ) {
    const customFriendsPhoto = this.customImages.get('friendsPhoto');

    // BACKGROUND BUILDING: РЕСТОРАН МАМУКА (replacing the castle!)
    this.drawMamukaRestaurant(ctx, x, groundY);

    // FLAGPOLE
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x + 40, groundY);
    ctx.lineTo(x + 40, groundY - 190);
    ctx.stroke();
    // Gold finial sphere
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(x + 40, groundY - 190, 8, 0, Math.PI * 2);
    ctx.fill();

    // RISING BIRTHDAY FLAG WITH "30"
    // Smoothly rises from bottom (groundY - 35) to top (groundY - 185)
    const flagBottom = groundY - 35;
    const flagTop = groundY - 185;
    const flagY = flagBottom - flagProgress * (flagBottom - flagTop);
    const wave = Math.sin(animFrame * 0.5) * 5;

    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.moveTo(x + 43, flagY);
    ctx.lineTo(x + 102 + wave, flagY + 18);
    ctx.lineTo(x + 43, flagY + 36);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px "Rubik", sans-serif';
    ctx.fillText('30!', x + 50, flagY + 23);

    // Banner above the friends
    ctx.fillStyle = isDancing ? '#ec4899' : '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(x - 20, groundY - 220, 320, 36, 8);
    ctx.fill();
    ctx.fillStyle = isDancing ? '#ffffff' : '#78350f';
    ctx.font = 'bold 13px "Press Start 2P", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isDancing ? '🎂 ТАНЦУЮТ ВСЕ! 30 ЛЕТ! 🎂' : 'ДРУЗЬЯ ЖДУТ ТЕБЯ!', x + 140, groundY - 196);

    // --- REAL PHOTO OF FRIENDS (Photo 3 BuMB06tFQnE.jpg) ---
    if (customFriendsPhoto) {
      ctx.save();
      // Gold ornate frame
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(x - 10, groundY - 170, 220, 150);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3;
      ctx.strokeRect(x - 10, groundY - 170, 220, 150);
      ctx.drawImage(customFriendsPhoto, x - 5, groundY - 165, 210, 140);

      ctx.restore();
    }

    // --- THE 4 FRIENDS DANCING IN FRONT ---
    this.drawFriend(ctx, x - 20, groundY, '#475569', '#1e293b', '#92400e', isDancing, animFrame, 0);
    this.drawFriend(ctx, x + 25, groundY, '#0284c7', '#ec4899', '#fde047', isDancing, animFrame, 1);
    this.drawFriend(ctx, x + 70, groundY, '#1e3a8a', '#d97706', '#fef08a', isDancing, animFrame, 2);
    this.drawFriend(ctx, x + 115, groundY, '#86efac', '#86efac', '#78350f', isDancing, animFrame, 3);

    // BIG TREASURE CHEST ON THE RIGHT (x + 270, completely clear of friends!)
    this.drawBigTreasureChest(ctx, x + 270, groundY, animFrame);
  }

  private drawFriend(
    ctx: CanvasRenderingContext2D,
    bx: number,
    by: number,
    jacketColor: string,
    accentColor: string,
    hairColor: string,
    isDancing: boolean = false,
    animFrame: number = 0,
    friendIndex: number = 0
  ) {
    ctx.save();
    const danceBounce = isDancing ? Math.abs(Math.sin(animFrame * 0.8 + friendIndex * 0.9)) * 12 : 0;
    const danceTilt = isDancing ? Math.sin(animFrame * 0.8 + friendIndex * 0.9) * 0.1 : 0;
    ctx.translate(bx + 20, by - danceBounce);
    if (isDancing) {
      ctx.rotate(danceTilt);
    }

    // Legs
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-8, -18, 5, 18);
    ctx.fillRect(3, -18, 5, 18);

    // Boots
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-10, -4, 7, 4);
    ctx.fillRect(3, -4, 7, 4);

    // Puffer jacket / hoodie
    ctx.fillStyle = jacketColor;
    ctx.beginPath();
    ctx.roundRect(-14, -50, 28, 34, 4);
    ctx.fill();

    // Fur hood or hoodie trim
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(0, -48, 12, Math.PI, 0);
    ctx.fill();

    // Face
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -48, 8, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.arc(0, -52, 9, Math.PI * 0.9, Math.PI * 2.1);
    ctx.fill();

    // Friendly smile
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, -46, 3, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // Party shaker / waving hands
    if (isDancing) {
      const armWave = Math.sin(animFrame * 0.8 + friendIndex * 1.1) * 8;
      // Left hand waving high
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(-16, -55 + armWave, 3.5, 0, Math.PI * 2);
      ctx.arc(16, -55 - armWave, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Floating party symbols above head
      ctx.fillStyle = '#fde047';
      ctx.font = '12px sans-serif';
      const symbols = ['🎵', '🎉', '✨', '💖'];
      ctx.fillText(symbols[friendIndex % symbols.length], -5, -68 - (danceBounce * 0.3));
    } else {
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(14, -42, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // --- RESTAURANT MAMUKA (РЕСТОРАН МАМУКА) ---
  public drawMamukaRestaurant(ctx: CanvasRenderingContext2D, x: number, groundY: number) {
    ctx.save();
    const rX = x + 30;
    const rW = 360;
    const rH = 195;
    const rY = groundY - rH;

    // Warm Georgian Terracotta Brick Walls
    ctx.fillStyle = '#b45309';
    ctx.fillRect(rX, rY, rW, rH);

    // Decorative Timber Post & Beams
    ctx.fillStyle = '#451a03';
    ctx.fillRect(rX, rY, 12, rH);
    ctx.fillRect(rX + rW - 12, rY, 12, rH);
    ctx.fillRect(rX, rY, rW, 10);
    ctx.fillRect(rX, rY + 80, rW, 8);

    // Gabled Roof with Terracotta Tiles
    ctx.beginPath();
    ctx.moveTo(rX - 18, rY);
    ctx.lineTo(rX + rW / 2, rY - 50);
    ctx.lineTo(rX + rW + 18, rY);
    ctx.closePath();
    ctx.fillStyle = '#9a3412';
    ctx.fill();
    ctx.strokeStyle = '#431407';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Warm Arched Windows with glowing golden-yellow light
    ctx.fillStyle = '#fef08a';
    for (let w = 0; w < 4; w++) {
      const wx = rX + 28 + w * 78;
      ctx.beginPath();
      ctx.arc(wx + 18, rY + 36, 18, Math.PI, 0);
      ctx.rect(wx, rY + 36, 36, 30);
      ctx.fill();
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // Wooden Georgian Entrance Archway
    ctx.fillStyle = '#291206';
    ctx.beginPath();
    ctx.arc(rX + rW / 2, groundY - 50, 24, Math.PI, 0);
    ctx.rect(rX + rW / 2 - 24, groundY - 50, 48, 50);
    ctx.fill();

    // Wine Barrels on Veranda
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.roundRect(rX + 16, groundY - 32, 28, 32, 5);
    ctx.roundRect(rX + rW - 44, groundY - 32, 28, 32, 5);
    ctx.fill();

    // Party Garland Fairy Lights strung across the roof!
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(rX, rY);
    ctx.quadraticCurveTo(rX + rW / 2, rY + 18, rX + rW, rY);
    ctx.stroke();
    const bulbColors = ['#f59e0b', '#ec4899', '#38bdf8', '#4ade80', '#fbbf24'];
    for (let b = 0; b < 16; b++) {
      const bx = rX + 12 + b * 21;
      const by = rY + Math.sin((b / 16) * Math.PI) * 16;
      ctx.fillStyle = bulbColors[b % bulbColors.length];
      ctx.beginPath();
      ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // MAIN GLOWING RESTAURANT SIGNBOARD: «РЕСТОРАН МАМУКА»
    ctx.fillStyle = '#451a03';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(rX + 30, rY + 100, rW - 60, 44, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 16px "Rubik", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🍷 РЕСТОРАН МАМУКА 🍷', rX + rW / 2, rY + 128);

    ctx.restore();
  }

  // --- BIG TREASURE CHEST ON THE RIGHT OF CHARACTERS ---
  // (Large, shiny, completely to the right so it doesn't block friends or characters)
  public drawBigTreasureChest(ctx: CanvasRenderingContext2D, chestX: number, groundY: number, animFrame: number = 0) {
    ctx.save();
    const chestW = 92;
    const chestH = 70;
    const chestY = groundY - chestH;

    // Glowing golden ambient light
    const glow = Math.sin(animFrame * 0.8) * 6;
    ctx.fillStyle = 'rgba(251, 191, 36, 0.28)';
    ctx.beginPath();
    ctx.arc(chestX + chestW / 2, chestY + chestH / 2, 58 + glow, 0, Math.PI * 2);
    ctx.fill();

    // Chest Body (Rich Dark Mahogany)
    ctx.fillStyle = '#78350f';
    ctx.fillRect(chestX, chestY + 20, chestW, chestH - 20);

    // Open Curved Lid tilted back
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.ellipse(chestX + chestW / 2, chestY + 18, chestW / 2, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Radiant Gold Light emerging from inside
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.ellipse(chestX + chestW / 2, chestY + 18, chestW / 2 - 5, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shiny Gold Coins and Precious Jewels overflowing
    for (let c = 0; c < 22; c++) {
      const cx = chestX + 10 + (c * 15) % (chestW - 20);
      const cy = chestY + 10 + Math.sin(c * 2.1) * 8;
      ctx.fillStyle = c % 4 === 0 ? '#ef4444' : (c % 4 === 1 ? '#10b981' : (c % 4 === 2 ? '#3b82f6' : '#facc15'));
      ctx.beginPath();
      ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Heavy Gold Straps & Reinforced Corner Brackets
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(chestX + 8, chestY + 20, 12, chestH - 20);
    ctx.fillRect(chestX + chestW - 20, chestY + 20, 12, chestH - 20);
    ctx.fillRect(chestX, chestY + 42, chestW, 8);

    // Big Golden Royal Lock / Clasp
    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(chestX + chestW / 2 - 10, chestY + 34, 20, 22, 5);
    ctx.fill();
    ctx.stroke();

    // Keyhole
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(chestX + chestW / 2, chestY + 42, 3.5, 0, Math.PI * 2);
    ctx.rect(chestX + chestW / 2 - 2, chestY + 42, 4, 6);
    ctx.fill();

    // Floating festive sparkles & jewels above chest
    ctx.fillStyle = '#fde047';
    ctx.font = '16px sans-serif';
    ctx.fillText('✨', chestX + 10, chestY - 6 + Math.sin(animFrame * 0.8) * 4);
    ctx.fillText('🪙', chestX + chestW / 2 - 9, chestY - 16 - Math.abs(Math.sin(animFrame * 0.8)) * 8);
    ctx.fillText('👑', chestX + chestW - 14, chestY - 8 + Math.cos(animFrame * 0.8) * 4);

    // Notice: NO text banner blocking friends or characters!
    ctx.restore();
  }

  // --- LANDMARK 1: ЗАВОД ЛАКОКРАСКА ---
  public drawLacockraska(ctx: CanvasRenderingContext2D, x: number, groundY: number) {
    ctx.save();
    // Industrial Red Brick Factory Complex
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(x, groundY - 150, 240, 150);

    // Sawtooth Factory Roofs
    ctx.fillStyle = '#450a0a';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * 80, groundY - 150);
      ctx.lineTo(x + i * 80 + 40, groundY - 180);
      ctx.lineTo(x + (i + 1) * 80, groundY - 150);
      ctx.closePath();
      ctx.fill();
    }

    // Chimney 1: Tall Red & White Striped Industrial Chimney
    const ch1X = x + 20;
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(ch1X, groundY - 260, 26, 110);
    for (let s = 0; s < 5; s++) {
      ctx.fillStyle = s % 2 === 0 ? '#ef4444' : '#ffffff';
      ctx.fillRect(ch1X, groundY - 260 + s * 22, 26, 22);
    }
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(ch1X - 3, groundY - 266, 32, 6);

    // Chimney 2
    const ch2X = x + 190;
    for (let s = 0; s < 4; s++) {
      ctx.fillStyle = s % 2 === 0 ? '#ef4444' : '#ffffff';
      ctx.fillRect(ch2X, groundY - 230 + s * 20, 22, 20);
    }
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(ch2X - 2, groundY - 235, 26, 5);

    // Factory Windows
    ctx.fillStyle = '#fef08a';
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 6; col++) {
        ctx.fillRect(x + 18 + col * 36, groundY - 130 + row * 40, 20, 24);
      }
    }

    // Big Illuminated Industrial Signboard: «ЗАВОД ЛАКОКРАСКА»
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(x + 10, groundY - 185, 220, 32, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 12px "Rubik", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏭 ЗАВОД ЛАКОКРАСКА', x + 120, groundY - 164);

    ctx.restore();
  }

  // --- LANDMARK 2: ЯРОСЛАВСКИЙ ПОЛИТЕХНИЧЕСКИЙ ИНСТИТУТ ---
  public drawPolitekh(ctx: CanvasRenderingContext2D, x: number, groundY: number) {
    ctx.save();
    // Neoclassical University Facade
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(x, groundY - 170, 340, 170);

    // Wings
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x, groundY - 170, 60, 170);
    ctx.fillRect(x + 280, groundY - 170, 60, 170);

    // Monumental Portico
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x + 70, groundY - 195, 200, 195);

    // Triangular Pediment
    ctx.beginPath();
    ctx.moveTo(x + 60, groundY - 195);
    ctx.lineTo(x + 170, groundY - 240);
    ctx.lineTo(x + 280, groundY - 195);
    ctx.closePath();
    ctx.fillStyle = '#e2e8f0';
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 6 Classical Columns
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    for (let c = 0; c < 6; c++) {
      const colX = x + 85 + c * 30;
      ctx.fillRect(colX, groundY - 190, 12, 190);
      ctx.strokeRect(colX, groundY - 190, 12, 190);
      ctx.fillRect(colX - 2, groundY - 193, 16, 4);
    }

    // Wide Steps
    for (let st = 0; st < 4; st++) {
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(x + 50 - st * 8, groundY - 16 + st * 4, 240 + st * 16, 4);
    }

    // Windows
    ctx.fillStyle = '#1e3a8a';
    for (let w = 0; w < 4; w++) {
      const wx = x + 14 + (w < 2 ? w * 24 : 252 + (w - 2) * 24);
      ctx.beginPath();
      ctx.arc(wx + 8, groundY - 130, 8, Math.PI, 0);
      ctx.rect(wx, groundY - 130, 16, 26);
      ctx.fill();
    }

    // Golden Signboard: «ЯРОСЛАВСКИЙ ПОЛИТЕХНИЧЕСКИЙ ИНСТИТУТ»
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(x + 15, groundY - 225, 310, 28, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 10px "Rubik", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏛️ ЯРОСЛАВСКИЙ ПОЛИТЕХНИЧЕСКИЙ ИНСТИТУТ', x + 170, groundY - 207);

    ctx.restore();
  }

  // --- LANDMARK 3: РЕСТОРАН SUBWAY ---
  public drawSubway(ctx: CanvasRenderingContext2D, x: number, groundY: number) {
    ctx.save();
    // Fast-food restaurant building
    ctx.fillStyle = '#065f46';
    ctx.fillRect(x, groundY - 150, 220, 150);

    // Roof parapet
    ctx.fillStyle = '#eab308';
    ctx.fillRect(x, groundY - 160, 220, 10);
    ctx.fillStyle = '#15803d';
    ctx.fillRect(x, groundY - 150, 220, 8);

    // Striped Green & Yellow Awning
    const awningY = groundY - 105;
    for (let a = 0; a < 11; a++) {
      ctx.fillStyle = a % 2 === 0 ? '#16a34a' : '#facc15';
      ctx.fillRect(x + 10 + a * 18, awningY, 18, 16);
    }

    // Glass Storefront
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(x + 14, groundY - 85, 192, 75);
    ctx.fillStyle = '#0284c7';
    ctx.strokeRect(x + 14, groundY - 85, 192, 75);

    // Signboard: «SUBWAY»
    ctx.fillStyle = '#064e3b';
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(x + 20, groundY - 146, 180, 36, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 13px "Rubik", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#facc15';
    ctx.fillText('🥪 РЕСТОРАН SUBWAY 🥪', x + 110, groundY - 123);

    ctx.restore();
  }
}

