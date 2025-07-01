// ==UserScript==
// @name         LinkedIn Learning Speed Unlocker & Overlay with Buttons
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Unlock LinkedIn Learning video speed cap with overlay, keyboard controls (+/-), and clickable buttons. Persists speed across videos and reloads.
// @author       Exel
// @match        https://www.linkedin.com/learning/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function waitForVideo() {
        return new Promise(resolve => {
            const checkVideo = () => {
                const video = document.querySelector('video');
                if (video) {
                    resolve(video);
                } else {
                    setTimeout(checkVideo, 300);
                }
            };
            checkVideo();
        });
    }

    function clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    }

    function setupVideoSpeedLock(video) {
        if (!video) return;

        const oldContainer = document.getElementById('ll-speed-container');
        if (oldContainer) oldContainer.remove();

        const container = document.createElement('div');
        container.id = 'll-speed-container';

        // Position overlay inside the player bottom-left, smaller but visible
        Object.assign(container.style, {
            position: 'absolute',
            bottom: '75px',
            left: '10px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: '#00ff00',
            padding: '5px 8px',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '700',
            fontFamily: 'Consolas, monospace',
            zIndex: 2147483647,
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textShadow: '0 0 4px black',
        });

        // Insert container into player's parent (to be positioned relative)
        // The player element often has class "video-js" or contains the video element
        const player = video.closest('.video-js') || video.parentElement;
        if (player) {
            // Make sure player is positioned relatively for absolute child positioning
            if (getComputedStyle(player).position === 'static') {
                player.style.position = 'relative';
            }
            player.appendChild(container);
        } else {
            // fallback to body fixed positioning
            Object.assign(container.style, {
                position: 'fixed',
                bottom: '20px',
                left: '20px',
            });
            document.body.appendChild(container);
        }

        const speedLabel = document.createElement('div');
        speedLabel.id = 'll-speed-label';
        speedLabel.style.minWidth = '55px';
        speedLabel.style.textAlign = 'center';

        const btnStyle = {
            cursor: 'pointer',
            backgroundColor: 'transparent',
            border: '2px solid #00ff00',
            color: '#00ff00',
            borderRadius: '4px',
            width: '26px',
            height: '26px',
            fontSize: '18px',
            fontWeight: '700',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            userSelect: 'none',
            transition: 'background-color 0.2s ease',
        };

        const btnPlus = document.createElement('button');
        btnPlus.textContent = '+';
        Object.assign(btnPlus.style, btnStyle);
        btnPlus.title = 'Increase Speed';

        const btnMinus = document.createElement('button');
        btnMinus.textContent = '-';
        Object.assign(btnMinus.style, btnStyle);
        btnMinus.title = 'Decrease Speed';

        btnPlus.addEventListener('mouseenter', () => btnPlus.style.backgroundColor = 'rgba(0,255,0,0.2)');
        btnPlus.addEventListener('mouseleave', () => btnPlus.style.backgroundColor = 'transparent');
        btnMinus.addEventListener('mouseenter', () => btnMinus.style.backgroundColor = 'rgba(0,255,0,0.2)');
        btnMinus.addEventListener('mouseleave', () => btnMinus.style.backgroundColor = 'transparent');

        container.appendChild(btnMinus);
        container.appendChild(speedLabel);
        container.appendChild(btnPlus);

        const originalDescriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'playbackRate');
        if (!originalDescriptor) {
            console.warn('[LL Speed Unlocker] Cannot find original playbackRate descriptor');
            return;
        }

        let desiredSpeed = parseFloat(localStorage.getItem('ll-speed-unlocker-rate')) || 3.0;
        desiredSpeed = clamp(desiredSpeed, 0.25, 15);
        speedLabel.textContent = `${desiredSpeed.toFixed(2)}x`;

        Object.defineProperty(video, 'playbackRate', {
            configurable: true,
            enumerable: true,
            get() {
                return originalDescriptor.get.call(this);
            },
            set(value) {
                value = clamp(value, 0.25, 15);

                if (value < desiredSpeed) {
                    value = desiredSpeed;
                } else {
                    desiredSpeed = value;
                    localStorage.setItem('ll-speed-unlocker-rate', desiredSpeed);
                    speedLabel.textContent = `${desiredSpeed.toFixed(2)}x`;
                    console.log(`[LL Speed Unlocker] Speed set to ${desiredSpeed}x`);
                }
                return originalDescriptor.set.call(this, value);
            }
        });

        video.playbackRate = desiredSpeed;

        btnPlus.onclick = () => {
            desiredSpeed = clamp(desiredSpeed + 0.25, 0.25, 15);
            localStorage.setItem('ll-speed-unlocker-rate', desiredSpeed);
            video.playbackRate = desiredSpeed;
            speedLabel.textContent = `${desiredSpeed.toFixed(2)}x`;
        };

        btnMinus.onclick = () => {
            desiredSpeed = clamp(desiredSpeed - 0.25, 0.25, 15);
            localStorage.setItem('ll-speed-unlocker-rate', desiredSpeed);
            video.playbackRate = desiredSpeed;
            speedLabel.textContent = `${desiredSpeed.toFixed(2)}x`;
        };
    }

    async function init() {
        let video = await waitForVideo();
        setupVideoSpeedLock(video);

        const observer = new MutationObserver(() => {
            const newVideo = document.querySelector('video');
            if (newVideo !== video) {
                console.log('[LL Speed Unlocker] Detected video change');
                video = newVideo;
                setupVideoSpeedLock(video);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    init();

    window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.isComposing) return;

        const video = document.querySelector('video');
        if (!video) return;

        let currentSpeed = parseFloat(localStorage.getItem('ll-speed-unlocker-rate')) || 3.0;
        if (e.key === '+' || e.key === '=') {
            currentSpeed = clamp(currentSpeed + 0.25, 0.25, 15);
            localStorage.setItem('ll-speed-unlocker-rate', currentSpeed);
            video.playbackRate = currentSpeed;
        }
        if (e.key === '-') {
            currentSpeed = clamp(currentSpeed - 0.25, 0.25, 15);
            localStorage.setItem('ll-speed-unlocker-rate', currentSpeed);
            video.playbackRate = currentSpeed;
        }
    });
})();
