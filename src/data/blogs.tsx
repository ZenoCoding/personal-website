import { ReactNode } from "react";
import Image from "next/image";

export interface BlogPost {
    slug: string;
    title: string;
    date: string;
    description: string;
    content: ReactNode;
    tags?: string[];
    image?: string;
}

export const blogs: BlogPost[] = [
    {
        slug: "shooting-on-the-move",
        title: "Shooting on The Move: Projectile Precision for Robots",
        date: "Jan 24, 2026",
        description: "Getting a robot to shoot balls accurately into a goal is a difficult engineering challenge. Getting a robot to shoot balls accurately while moving is even more difficult: velocity vectors add, and everything breaks.",
        tags: ["Robotics", "Simulation", "Math", "FRC"],
        image: "/photos/shooting_sim.png",
        content: (
            <>
                <p>
                    Shooting on the move is a common problem in high school robotics competitions like the FIRST Robotics Competition, due to the numerous strategic advantages that it grants, and the required combination of physical understanding and practical algorithmic problem solving.
                </p>
                <p>
                    With some clever code and high-school physics, we can create an accurate model to both simulate and create robot controller code that functions reliably.
                </p>

                <h2>The Problem</h2>
                <p>
                    There are many different kinds of goals that we may want to shoot projectiles into, but for our case, we’ll consider the simple flat, elevated, circular goal. Projectiles must enter from the top, and we’ll aim at the center.
                </p>

                <figure className="figure">
                    <Image
                        src="/photos/shooting_sim.png"
                        alt="Shooting Simulation Diagram"
                        width={800}
                        height={450}
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                    <figcaption className="figcaption">
                        Figure 1: Diagram of projectile motion entering a hub target.
                    </figcaption>
                </figure>

                <p>
                    One example is from this year’s FRC game, <em>Rebuilt 2026</em>. Robots must shoot large quantities of high-density foam balls into a cone called the hub.
                </p>

                <h2>Projectile Physics</h2>
                <p>
                    Let’s start with the simplest case. The robot isn’t moving, and is 5 meters away from the 2 meter high goal. How do we know what shot to take? How do we know at what velocity, and at what angle, to take the shot at?
                </p>
                <p>
                    High school projectile physics is very useful here. We’ll only consider the 2 dimensional case here, with yaw set so that the shooter is pointing directly at the target. Yaw deviations from target will be important later when we have to compensate for robot velocity.
                </p>
                <p>
                    Let us consider the exit velocity <strong>v</strong> and angle <strong>θ</strong> from horizontal. We can then define our velocity vector by its components:
                </p>

                <div className="codeBlock">
                    <span className="codeLine">v_x = v cos(θ)</span>
                    <span className="codeLine">v_y = v sin(θ)</span>
                </div>

                <p>
                    And then from kinematics, we can write our positions as a function of time <strong>t</strong>, given that gravitational acceleration is <strong>-g</strong>.
                </p>

                <div className="codeBlock">
                    <span className="codeLine">x(t) = v cos(θ) Δt</span>
                    <span className="codeLine">y(t) = v sin(θ) Δt - ½g(Δt)²</span>
                </div>

                <p>
                    Then by eliminating <strong>Δt</strong> by substitution, we can transform kinematics into geometry:
                </p>

                <div className="codeBlock">
                    <span className="codeLine">x / (v cosθ) = Δt</span>
                    <span className="codeLine">y(x) = v sinθ (x / v cosθ) - ½ g(x / v cosθ)²</span>
                </div>

                <div className="note">
                    <p>
                        <strong>Note:</strong> This article is a work in progress. Further analysis on moving reference frames and code implementation will be added soon.
                    </p>
                </div>
            </>
        ),
    },
    {
        slug: "hello-world",
        title: "Hello World",
        date: "Jan 23, 2026",
        description: "Welcome to my new blog section. This is a sample post to test the system.",
        tags: ["Site Update", "Next.js"],
        content: (
            <>
                <p>
                    Welcome to the new blog section of my website! I decided to build this
                    using a simple code-based approach rather than a complex CMS or Markdown
                    pipeline.
                </p>
                <h3>Why Code-Based?</h3>
                <p>
                    By defining posts directly in TypeScript/React, I have full control
                    over the layout and can easily embed interactive components directly
                    into my writing. No parsing required!
                </p>
                <div className="quoteBox">
                    "Simplicity is the ultimate sophistication." — Leonardo da Vinci
                </div>
                <p>
                    Stay tuned for more updates on my projects, thoughts on engineering,
                    and other cool stuff.
                </p>
            </>
        ),
    },
];
