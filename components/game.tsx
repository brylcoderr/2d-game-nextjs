"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import GameControls from "./game-controls"
import GameStats from "./game-stats"
import GameLegend from "./game-legend"
import MobileControls from "./mobile-controls"
import PauseMenu from "./pause-menu"
import { ParticleSystem } from "./particle-system"
import useMobileDetection from "@/hooks/use-mobile-detection"

// Update the game constants section to include new elements
const GAME_WIDTH = 800
const GAME_HEIGHT = 500
const PLAYER_SIZE = 30
const COIN_SIZE = 20
const OBSTACLE_SIZE = 40
const PLAYER_SPEED = 5
const COIN_COUNT = 5
const OBSTACLE_COUNT = 8
const POWERUP_SIZE = 25
const POWERUP_COUNT = 2
const STAR_COUNT = 50
const BONUS_SIZE = 25
const BONUS_COUNT = 2

// Update the GameObject interface to include color and type properties
interface GameObject {
  x: number
  y: number
  width: number
  height: number
  color?: string
  type?: string
  value?: number
  rotation?: number
}

// Update the GameState interface to include new elements
interface GameState {
  player: GameObject
  coins: GameObject[]
  obstacles: GameObject[]
  powerups: GameObject[]
  bonusItems: GameObject[]
  stars: GameObject[]
  score: number
  highScore: number
  isGameOver: boolean
  isPaused: boolean
  level: number
  invincible: boolean
  invincibleTimer: number
  scoreMultiplier: number
  multiplierTimer: number
}

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<GameState>({
    player: {
      x: GAME_WIDTH / 2 - PLAYER_SIZE / 2,
      y: GAME_HEIGHT / 2 - PLAYER_SIZE / 2,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      color: "#4cc9f0",
    },
    coins: [],
    obstacles: [],
    powerups: [],
    bonusItems: [],
    stars: [],
    score: 0,
    highScore: 0,
    isGameOver: false,
    isPaused: false,
    level: 1,
    invincible: false,
    invincibleTimer: 0,
    scoreMultiplier: 1,
    multiplierTimer: 0,
  })
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({})
  const [gameStarted, setGameStarted] = useState(false)
  const [showMainMenu, setShowMainMenu] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const particleSystem = useRef(new ParticleSystem())
  const isMobile = useMobileDetection()

  // Initialize game
  const initGame = () => {
    // Create stars for background
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * GAME_WIDTH,
      y: Math.random() * GAME_HEIGHT,
      width: 1 + Math.random() * 2,
      height: 1 + Math.random() * 2,
      color: `rgba(255, 255, 255, ${0.3 + Math.random() * 0.7})`,
    }));

    // Create coins at random positions with different values
    const coins = Array.from({ length: COIN_COUNT }, () => {
      const coinType = Math.random() > 0.7 ? "gold" : "silver";
      return {
        x: Math.random() * (GAME_WIDTH - COIN_SIZE),
        y: Math.random() * (GAME_HEIGHT - COIN_SIZE),
        width: COIN_SIZE,
        height: COIN_SIZE,
        type: coinType,
        value: coinType === "gold" ? 5 : 1,
        color: coinType === "gold" ? "#ffd700" : "#c0c0c0",
        rotation: 0,
      };
    });

    // Create obstacles at random positions with different shapes
    const obstacles = Array.from({ length: OBSTACLE_COUNT }, () => {
      const obstacleType = Math.random() > 0.5 ? "square" : "triangle";
      return {
        x: Math.random() * (GAME_WIDTH - OBSTACLE_SIZE),
        y: Math.random() * (GAME_HEIGHT - OBSTACLE_SIZE),
        width: OBSTACLE_SIZE,
        height: OBSTACLE_SIZE,
        type: obstacleType,
        color: obstacleType === "square" ? "#e63946" : "#d90429",
      };
    });

    // Create powerups
    const powerups = Array.from({ length: POWERUP_COUNT }, () => ({
      x: Math.random() * (GAME_WIDTH - POWERUP_SIZE),
      y: Math.random() * (GAME_HEIGHT - POWERUP_SIZE),
      width: POWERUP_SIZE,
      height: POWERUP_SIZE,
      type: "invincibility",
      color: "#9d4edd",
    }));

    // Create bonus items
    const bonusItems = Array.from({ length: BONUS_COUNT }, () => {
      const bonusType = Math.random() > 0.5 ? "multiplier" : "timeBonus";
      return {
        x: Math.random() * (GAME_WIDTH - BONUS_SIZE),
        y: Math.random() * (GAME_HEIGHT - BONUS_SIZE),
        width: BONUS_SIZE,
        height: BONUS_SIZE,
        type: bonusType,
        value: bonusType === "multiplier" ? 2 : 10,
        color: bonusType === "multiplier" ? "#10b981" : "#3b82f6",
        rotation: 0,
      };
    });

    setGameState((prev) => ({
      player: {
        x: GAME_WIDTH / 2 - PLAYER_SIZE / 2,
        y: GAME_HEIGHT / 2 - PLAYER_SIZE / 2,
        width: PLAYER_SIZE,
        height: PLAYER_SIZE,
        color: "#4cc9f0",
      },
      coins,
      obstacles,
      powerups,
      bonusItems,
      stars,
      score: 0,
      highScore: prev.highScore,
      isGameOver: false,
      isPaused: false,
      level: 1,
      invincible: false,
      invincibleTimer: 0,
      scoreMultiplier: 1,
      multiplierTimer: 0,
    }));
    setGameStarted(true);
    setShowMainMenu(false);
    particleSystem.current = new ParticleSystem();
  };

  // Check collision between two objects
  const checkCollision = (obj1: GameObject, obj2: GameObject) => {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    )
  }

  // Handle mobile control presses
  const handleMobileControl = (key: string, pressed: boolean) => {
    setKeys(prev => ({ ...prev, [key]: pressed }))
  }

  const gameLoop = useCallback(() => {
    setGameState((prevState) => {
      // Update particle system
      particleSystem.current.update();

      // Move player based on key presses
      let newX = prevState.player.x;
      let newY = prevState.player.y;

      if (keys.ArrowUp || keys.w) newY = Math.max(0, newY - PLAYER_SPEED);
      if (keys.ArrowDown || keys.s) newY = Math.min(GAME_HEIGHT - PLAYER_SIZE, newY + PLAYER_SPEED);
      if (keys.ArrowLeft || keys.a) newX = Math.max(0, newX - PLAYER_SPEED);
      if (keys.ArrowRight || keys.d) newX = Math.min(GAME_WIDTH - PLAYER_SIZE, newX + PLAYER_SPEED);

      const newPlayer = { ...prevState.player, x: newX, y: newY };

      // Update coin rotations
      const updatedCoins = prevState.coins.map(coin => ({
        ...coin,
        rotation: ((coin.rotation || 0) + 0.05) % (Math.PI * 2)
      }));

      // Update bonus item rotations
      const updatedBonusItems = prevState.bonusItems.map(item => ({
        ...item,
        rotation: ((item.rotation || 0) + 0.03) % (Math.PI * 2)
      }));

      // Check for coin collisions
      const remainingCoins = updatedCoins.filter(
        (coin) => !checkCollision(newPlayer, coin)
      );
      
      // Calculate score from collected coins
      const collectedCoins = updatedCoins.filter(
        (coin) => !remainingCoins.includes(coin)
      );
      
      // Apply score multiplier to collected coins
      const pointsGained = collectedCoins.reduce(
        (sum, coin) => sum + (coin.value || 1) * prevState.scoreMultiplier, 
        0
      );
      
      // Create particle effects for collected coins
      collectedCoins.forEach(coin => {
        particleSystem.current.createCoinCollect(
          coin.x + coin.width / 2,
          coin.y + coin.height / 2,
          coin.color || "#ffd700"
        );
      });
      
      const newScore = prevState.score + pointsGained;
      
      // Update high score if needed
      const newHighScore = Math.max(prevState.highScore, newScore);

      // Generate new coins if all are collected
      let newCoins = remainingCoins;
      let newLevel = prevState.level;
      let newObstacles = prevState.obstacles;
      
      if (newCoins.length === 0) {
        // Level up when all coins are collected
        newLevel = prevState.level + 1;
        
        // Create new coins with more gold coins at higher levels
        newCoins = Array.from({ length: COIN_COUNT + Math.floor(newLevel / 2) }, () => {
          const coinType = Math.random() > (0.7 - newLevel * 0.05) ? "gold" : "silver";
          return {
            x: Math.random() * (GAME_WIDTH - COIN_SIZE),
            y: Math.random() * (GAME_HEIGHT - COIN_SIZE),
            width: COIN_SIZE,
            height: COIN_SIZE,
            type: coinType,
            value: coinType === "gold" ? 5 : 1,
            color: coinType === "gold" ? "#ffd700" : "#c0c0c0",
            rotation: 0,
          };
        });
        
        // Add more obstacles at higher levels
        const newObstacleCount = OBSTACLE_COUNT + Math.floor(newLevel / 2);
        newObstacles = Array.from({ length: newObstacleCount }, () => {
          const obstacleType = Math.random() > 0.5 ? "square" : "triangle";
          return {
            x: Math.random() * (GAME_WIDTH - OBSTACLE_SIZE),
            y: Math.random() * (GAME_HEIGHT - OBSTACLE_SIZE),
            width: OBSTACLE_SIZE,
            height: OBSTACLE_SIZE,
            type: obstacleType,
            color: obstacleType === "square" ? "#e63946" : "#d90429",
          };
        });
      }

      // Check for powerup collisions
      const remainingPowerups = prevState.powerups.filter(
        (powerup) => !checkCollision(newPlayer, powerup)
      );
      
      // Apply powerup effects
      let isInvincible = prevState.invincible;
      let invincibleTimer = prevState.invincibleTimer;
      
      if (remainingPowerups.length < prevState.powerups.length) {
        // Powerup collected
        isInvincible = true;
        invincibleTimer = 300; // 5 seconds at 60fps
        
        // Create particle effect for powerup collection
        const collectedPowerup = prevState.powerups.find(
          p => !remainingPowerups.includes(p)
        );
        
        if (collectedPowerup) {
          particleSystem.current.createExplosion(
            collectedPowerup.x + collectedPowerup.width / 2,
            collectedPowerup.y + collectedPowerup.height / 2,
            "#9d4edd",
            30
          );
        }
      }
      
      // Update invincibility timer
      if (isInvincible) {
        invincibleTimer -= 1;
        if (invincibleTimer <= 0) {
          isInvincible = false;
        }
      }
      
      // Check for bonus item collisions
      const remainingBonusItems = updatedBonusItems.filter(
        (item) => !checkCollision(newPlayer, item)
      );
      
      // Apply bonus effects
      let scoreMultiplier = prevState.scoreMultiplier;
      let multiplierTimer = prevState.multiplierTimer;
      
      if (remainingBonusItems.length < updatedBonusItems.length) {
        // Bonus collected
        const collectedBonus = updatedBonusItems.find(
          b => !remainingBonusItems.includes(b)
        );
        
        if (collectedBonus) {
          if (collectedBonus.type === "multiplier") {
            scoreMultiplier = collectedBonus.value || 2;
            multiplierTimer = 300; // 5 seconds at 60fps
          }
          
          // Create particle effect for bonus collection
          particleSystem.current.createExplosion(
            collectedBonus.x + collectedBonus.width / 2,
            collectedBonus.y + collectedBonus.height / 2,
            collectedBonus.color || "#10b981",
            25
          );
        }
      }
      
      // Update multiplier timer
      if (multiplierTimer > 0) {
        multiplierTimer -= 1;
        if (multiplierTimer <= 0) {
          scoreMultiplier = 1;
        }
      }
      
      // Generate new powerups occasionally
      let newPowerups = remainingPowerups;
      if (Math.random() < 0.002 && newPowerups.length < POWERUP_COUNT) {
        newPowerups = [
          ...newPowerups,
          {
            x: Math.random() * (GAME_WIDTH - POWERUP_SIZE),
            y: Math.random() * (GAME_HEIGHT - POWERUP_SIZE),
            width: POWERUP_SIZE,
            height: POWERUP_SIZE,
            type: "invincibility",
            color: "#9d4edd",
          },
        ];
      }
      
      // Generate new bonus items occasionally
      let newBonusItems = remainingBonusItems;
      if (Math.random() < 0.001 && newBonusItems.length < BONUS_COUNT) {
        const bonusType = Math.random() > 0.5 ? "multiplier" : "timeBonus";
        newBonusItems = [
          ...newBonusItems,
          {
            x: Math.random() * (GAME_WIDTH - BONUS_SIZE),
            y: Math.random() * (GAME_HEIGHT - BONUS_SIZE),
            width: BONUS_SIZE,
            height: BONUS_SIZE,
            type: bonusType,
            value: bonusType === "multiplier" ? 2 : 10,
            color: bonusType === "multiplier" ? "#10b981" : "#3b82f6",
            rotation: 0,
          },
        ];
      }

      // Check for obstacle collisions (only if not invincible)
      const hitObstacle = !isInvincible && prevState.obstacles.some((obstacle) =>
        checkCollision(newPlayer, obstacle)
      );
      
      // Create explosion effect if player hits obstacle
      if (hitObstacle) {
        particleSystem.current.createExplosion(
          newPlayer.x + newPlayer.width / 2,
          newPlayer.y + newPlayer.height / 2,
          "#e63946",
          40
        );
      }

      return {
        ...prevState,
        player: newPlayer,
        coins: newCoins,
        obstacles: newObstacles,
        powerups: newPowerups,
        bonusItems: newBonusItems,
        score: newScore,
        highScore: newHighScore,
        level: newLevel,
        isGameOver: hitObstacle,
        invincible: isInvincible,
        invincibleTimer: invincibleTimer,
        scoreMultiplier: scoreMultiplier,
        multiplierTimer: multiplierTimer,
      };
    });
  }, [keys]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameState.isGameOver || gameState.isPaused) return;

    const gameLoopInterval = setInterval(gameLoop, 1000 / 60); // 60 FPS

    return () => clearInterval(gameLoopInterval);
  }, [gameStarted, gameState.isGameOver, gameState.isPaused, keys, gameLoop]);

  // Render game
  useEffect(() => {
    if (!canvasRef.current || !gameStarted) return;
  }, [canvasRef, gameStarted]);
  useEffect(() => {
    if (!canvasRef.current || !gameStarted) return;},[canvasRef,gameStarted])
    // Get canvas context
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, "#0f172a");
    gradient.addColorStop(1, "#1e293b");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw stars
    gameState.stars.forEach((star) => {
      ctx.fillStyle = star.color || "white";
      ctx.fillRect(star.x, star.y, star.width, star.height);

      ctx.fillStyle = star.color || "white";
      ctx.fillRect(star.x, star.y, star.width, star.height);

    // Draw level indicator
    ctx.font = "16px Arial";
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.textAlign = "left";
    ctx.fillText(`Level: ${gameState.level}`, 10, 20);

    // Draw score multiplier if active
    if (gameState.scoreMultiplier > 1) {
      ctx.font = "bold 18px Arial";
      ctx.fillStyle = "#10b981";
      ctx.textAlign = "right";
      ctx.fillText(`${gameState.scoreMultiplier}x Multiplier!`, GAME_WIDTH - 10, 20);
    }

    // Draw bonus items
    gameState.bonusItems.forEach((bonus) => {
      ctx.save();
      ctx.translate(bonus.x + bonus.width / 2, bonus.y + bonus.height / 2);
      ctx.rotate(bonus.rotation || 0);
      
      if (bonus.type === "multiplier") {
        // Draw multiplier bonus
        ctx.fillStyle = bonus.color || "#10b981";
        ctx.beginPath();
        ctx.arc(0, 0, bonus.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw "x2" text
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 12px Arial";
        ctx.fillText(`x${bonus.value}`, 0, 0);
      } else if (bonus.type === "timeBonus") {
        // Draw time bonus
        ctx.fillStyle = bonus.color || "#3b82f6";
        ctx.beginPath();
        ctx.arc(0, 0, bonus.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw clock icon
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, bonus.width / 3, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw clock hands
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -bonus.width / 6);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(bonus.width / 8, 0);
        ctx.stroke();
      }
      
      ctx.restore();
    });

    // Draw powerups
    gameState.powerups.forEach((powerup) => {
      ctx.fillStyle = powerup.color || "#9d4edd";
      ctx.beginPath();
      ctx.arc(
        powerup.x + powerup.width / 2,
        powerup.y + powerup.height / 2,
        powerup.width / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      // Draw star shape inside
      const centerX = powerup.x + powerup.width / 2;
      const centerY = powerup.y + powerup.height / 2;
      const spikes = 5;
      const outerRadius = powerup.width / 2;
      const innerRadius = powerup.width / 4;
      
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (Math.PI * i) / spikes - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fillStyle = "white";
      ctx.fill();
    });

    // Draw coins with animation
    gameState.coins.forEach((coin) => {
      ctx.save();
      ctx.translate(coin.x + coin.width / 2, coin.y + coin.height / 2);
      ctx.rotate(coin.rotation || 0);
      
      // Draw coin
      ctx.fillStyle = coin.color || "#ffd700";
      ctx.beginPath();
      ctx.arc(0, 0, coin.width / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw coin details
      ctx.fillStyle = coin.type === "gold" ? "#f59e0b" : "#94a3b8";
      ctx.beginPath();
      ctx.arc(0, 0, coin.width / 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw coin value
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 10px Arial";
      ctx.fillText(coin.value?.toString() || "1", 0, 0);
      
      ctx.restore();
    });

    // Draw obstacles
    gameState.obstacles.forEach((obstacle) => {
      if (obstacle.type === "square") {
        ctx.fillStyle = obstacle.color || "#e63946";
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Add details to square obstacles
        ctx.fillStyle = "#c1121f";
        ctx.fillRect(
          obstacle.x + obstacle.width * 0.25,
          obstacle.y + obstacle.height * 0.25,
          obstacle.width * 0.5,
          obstacle.height * 0.5
        );
      } else {
        // Draw triangle obstacle
        ctx.fillStyle = obstacle.color || "#d90429";
        ctx.beginPath();
        ctx.moveTo(obstacle.x + obstacle.width / 2, obstacle.y);
        ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
        ctx.lineTo(obstacle.x, obstacle.y + obstacle.height);
        ctx.closePath();
        ctx.fill();
        
        // Add details to triangle obstacles
        ctx.fillStyle = "#ef233c";
        ctx.beginPath();
        ctx.moveTo(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height * 0.3);
        ctx.lineTo(obstacle.x + obstacle.width * 0.7, obstacle.y + obstacle.height * 0.7);
        ctx.lineTo(obstacle.x + obstacle.width * 0.3, obstacle.y + obstacle.height * 0.7);
        ctx.closePath();
        ctx.fill();
      }
    });

    // Draw player with invincibility effect
    if (gameState.invincible) {
      // Draw invincibility glow
      const glowRadius = PLAYER_SIZE * 1.5;
      const gradient = ctx.createRadialGradient(
        gameState.player.x + PLAYER_SIZE / 2,
        gameState.player.y + PLAYER_SIZE / 2,
        PLAYER_SIZE / 2,
        gameState.player.x + PLAYER_SIZE / 2,
        gameState.player.y + PLAYER_SIZE / 2,
        glowRadius
      );
      gradient.addColorStop(0, "rgba(157, 78, 221, 0.8)");
      gradient.addColorStop(1, "rgba(157, 78, 221, 0)");
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(
        gameState.player.x + PLAYER_SIZE / 2,
        gameState.player.y + PLAYER_SIZE / 2,
        glowRadius,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      // Pulsating effect based on timer
      const pulseScale = 1 + 0.1 * Math.sin(gameState.invincibleTimer * 0.1);
      
      // Draw player with shield
      ctx.fillStyle = "#4cc9f0";
      ctx.beginPath();
      ctx.arc(
        gameState.player.x + PLAYER_SIZE / 2,
        gameState.player.y + PLAYER_SIZE / 2,
        (PLAYER_SIZE / 2) * pulseScale,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      // Draw shield
      ctx.strokeStyle = "#9d4edd";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(
        gameState.player.x + PLAYER_SIZE / 2,
        gameState.player.y + PLAYER_SIZE / 2,
        (PLAYER_SIZE / 2 + 5) * pulseScale,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    } else {
      // Draw regular player (spaceship-like)
      ctx.fillStyle = gameState.player.color || "#4cc9f0";
      
      // Draw player body
      ctx.beginPath();
      ctx.moveTo(gameState.player.x + gameState.player.width / 2, gameState.player.y);
      ctx.lineTo(gameState.player.x + gameState.player.width, gameState.player.y + gameState.player.height);
      ctx.lineTo(gameState.player.x, gameState.player.y + gameState.player.height);
      ctx.closePath();
      ctx.fill();
      
      // Draw player details
      ctx.fillStyle = "#0096c7";
      ctx.beginPath();
      ctx.moveTo(gameState.player.x + gameState.player.width / 2, gameState.player.y + gameState.player.height * 0.3);
      ctx.lineTo(gameState.player.x + gameState.player.width * 0.7, gameState.player.y + gameState.player.height * 0.8);
      ctx.lineTo(gameState.player.x + gameState.player.width * 0.3, gameState.player.y + gameState.player.height * 0.8);
      ctx.closePath();
      ctx.fill();
      
      // Draw engine flames
      if (keys.ArrowUp || keys.w || keys.ArrowDown || keys.s || keys.ArrowLeft || keys.a || keys.ArrowRight || keys.d) {
        ctx.fillStyle = "#f77f00";
        ctx.beginPath();
        ctx.moveTo(gameState.player.x + gameState.player.width * 0.3, gameState.player.y + gameState.player.height);
        ctx.lineTo(gameState.player.x + gameState.player.width * 0.5, gameState.player.y + gameState.player.height + 10);
        ctx.lineTo(gameState.player.x + gameState.player.width * 0.7, gameState.player.y + gameState.player.height);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Draw particles
    particleSystem.current.draw(ctx);

    // Draw game over message
    if (gameState.isGameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      
      // Game over title
      ctx.font = "bold 48px Arial";
      ctx.fillStyle = "#e63946";
      ctx.textAlign = "center";
      ctx.fillText("Game Over!", GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50);
      
      // Final score
      ctx.font = "24px Arial";
      ctx.fillStyle = "white";
      ctx.fillText(`Final Score: ${gameState.score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2);
      
      // High score
      ctx.font = "20px Arial";
      ctx.fillStyle = "#ffd700";
      ctx.fillText(`High Score: ${gameState.highScore}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30);
      
      // Level reached
      ctx.font = "18px Arial";
      ctx.fillStyle = "#4cc9f0";
      ctx.fillText(`Level Reached: ${gameState.level}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60);
    }
  }, [gameState, gameStarted, keys]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default behavior for arrow keys to avoid page scrolling
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }
      
      // Toggle pause when pressing Escape or P
      if ((e.key === "Escape" || e.key === "p" || e.key === "P") && gameStarted && !gameState.isGameOver) {
        setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
        return;
      }
      
      setKeys((prevKeys) => ({ ...prevKeys, [e.key]: true }));
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys((prevKeys) => ({ ...prevKeys, [e.key]: false }));
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    }
  }, [gameStarted, gameState.isGameOver, gameState.isPaused]);

  // Adjust canvas size for mobile
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;
        if (container) {
          const containerWidth = container.clientWidth;
          
          // If on mobile or small screen, scale the canvas
          if (containerWidth < GAME_WIDTH) {
            const scale = containerWidth / GAME_WIDTH;
            canvasRef.current.style.width = `${GAME_WIDTH * scale}px`;
            canvasRef.current.style.height = `${GAME_HEIGHT * scale}px`;
          } else {
            canvasRef.current.style.width = `${GAME_WIDTH}px`;
            canvasRef.current.style.height = `${GAME_HEIGHT}px`;
          }
        }
      }
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [gameStarted]);

  const togglePause = () => {
    setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  }

  const restartGame = () => {
    initGame();
  }

  const goToMainMenu = () => {
    setGameStarted(false);
    setShowMainMenu(true);
  }

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  }

  // Calculate responsive canvas size
  const getCanvasStyle = () => {
    if (isMobile) {
      return {
        width: "100%",
        height: "auto",
        maxWidth: `${GAME_WIDTH}px`,
      };
    }
    return {};
  };

  return (
    <Card className="p-4 bg-gray-800 border-gray-700">
      <div className="flex flex-col items-center">
        {showMainMenu ? (
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-white mb-6">Cosmic Coin Collector</h2>
            <div className="mb-8 p-6 bg-gray-700 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
              <p className="text-gray-300 mb-2">Use arrow keys, WASD, or on-screen controls to move your spaceship</p>
              <p className="text-gray-300 mb-2">Collect coins to increase your score (gold = 5 points!)</p>
              <p className="text-gray-300 mb-2">Grab purple power-ups for temporary invincibility</p>
              <p className="text-gray-300 mb-2">Green multipliers double your points for a short time</p>
              <p className="text-gray-300 mb-4">Avoid red obstacles or the game ends</p>
              <p className="text-gray-300 mb-4">Press ESC or P to pause the game</p>
            </div>
            <Button 
              onClick={initGame} 
              className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6"
              size="lg"
            >
              Start Game
            </Button>
            <div className="mt-4">
              <Button 
                onClick={toggleSound} 
                variant="outline" 
                className="text-white border-gray-600"
              >
                {soundEnabled ? "Sound: On" : "Sound: Off"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <GameStats 
              score={gameState.score} 
              isPaused={gameState.isPaused} 
              highScore={gameState.highScore}
              level={gameState.level}
              invincible={gameState.invincible}
              multiplier={gameState.scoreMultiplier}
            />
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={GAME_WIDTH}
                height={GAME_HEIGHT}
                className="border border-gray-600 rounded-md shadow-lg"
                style={getCanvasStyle()}
              />
              {gameState.isPaused && !gameState.isGameOver && (
                <PauseMenu 
                  onResume={togglePause}
                  onRestart={restartGame}
                  onHome={goToMainMenu}
                  onToggleSound={toggleSound}
                  soundEnabled={soundEnabled}
                />
              )}
            </div>
            {!gameState.isPaused && !gameState.isGameOver && (
              <GameControls
                isPaused={gameState.isPaused}
                isGameOver={gameState.isGameOver}
                onPause={togglePause}
                onRestart={restartGame}
              />
            )}
            {gameState.isGameOver && (
              <div className="mt-4 flex gap-4">
                <Button 
                  onClick={restartGame} 
                  className="bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  Play Again
                </Button>
                <Button 
                  onClick={goToMainMenu} 
                  variant="outline" 
                  className="text-white border-gray-600"
                >
                  Main Menu
                </Button>
              </div>
            )}
            {!gameState.isGameOver && !gameState.isPaused && (
              <GameLegend />
            )}
          </>
        )}
      </div>
      
      {/* Mobile controls */}
      <MobileControls 
        onControlPress={handleMobileControl} 
        isVisible={isMobile && gameStarted && !gameState.isPaused && !gameState.isGameOver} 
      />
    </Card>
  );
}