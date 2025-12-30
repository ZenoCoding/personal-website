import { Metadata } from "next";
import Link from "next/link";
import styles from "./Intake.module.css";

export const metadata: Metadata = {
    title: "FRC Intake Subsystem | Student Resources",
    description: "Learn to write a WPILib subsystem for an FRC intake mechanism.",
    robots: { index: false, follow: false },
};

export default function IntakeLessonPage() {
    return (
        <main className={styles.page}>
            <article className={styles.article}>
                {/* Header */}
                <Link href="/students" className={styles.backNav}>
                    <span>←</span> Back to Resources
                </Link>

                <header className={styles.header}>
                    <h1 className={styles.title}>Building an Intake Subsystem</h1>
                    <p className={styles.subtitle}>
                        Learn how to write a complete WPILib subsystem for a ground intake
                        mechanism with motion-profiled arm control and roller motors.
                    </p>
                    <div className={styles.downloadButtons}>
                        <a
                            href="/lessons/intake/IntakeSkeleton.java"
                            download
                            className={`${styles.downloadBtn} ${styles.downloadBtnPrimary}`}
                        >
                            ↓ Download Skeleton
                        </a>
                        <a
                            href="/lessons/intake/Intake.java"
                            download
                            className={`${styles.downloadBtn} ${styles.downloadBtnSecondary}`}
                        >
                            ↓ Download Solution
                        </a>
                    </div>
                </header>

                {/* Intro */}
                <Section title="What You'll Build">
                    <p>
                        An <strong>intake subsystem</strong> is responsible for picking up
                        game pieces from the floor. Ours has two main parts:
                    </p>
                    <ul>
                        <li>
                            <strong>Arm:</strong> Moves between a retracted (up) and deployed
                            (down) position using Motion Magic.
                        </li>
                        <li>
                            <strong>Rollers:</strong> Spin to pull in or eject the game piece.
                        </li>
                    </ul>
                </Section>

                {/* Prerequisites */}
                <Section title="Prerequisites & Resources">
                    <p>Before diving in, familiarize yourself with these key documentation pages:</p>
                    <ul>
                        <li>
                            <ExternalLink href="https://docs.wpilib.org/en/stable/docs/software/commandbased/subsystems.html">
                                WPILib: Subsystems
                            </ExternalLink>{" "}
                            – Official guide to command-based subsystems
                        </li>
                        <li>
                            <ExternalLink href="https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/device-specific/talonfx/index.html">
                                CTRE: TalonFX API
                            </ExternalLink>{" "}
                            – Phoenix 6 motor controller documentation
                        </li>
                        <li>
                            <ExternalLink href="https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/device-specific/talonfx/motion-magic.html">
                                CTRE: Motion Magic
                            </ExternalLink>{" "}
                            – Motion profiling guide
                        </li>
                    </ul>
                </Section>

                {/* Key Concepts */}
                <Section title="Key Concepts">
                    <ConceptCard
                        title="What is a SubsystemBase?"
                        emoji="🧩"
                    >
                        <p>
                            A <code>SubsystemBase</code> is a WPILib class that represents a physical
                            part of your robot (drivetrain, arm, shooter, etc.). It encapsulates
                            hardware (motors, sensors) and provides methods for commands to control them.
                        </p>
                        <CodeBlock>{`public class Intake extends SubsystemBase {
    private final TalonFX motor = new TalonFX(1);
    
    @Override
    public void periodic() {
        // Called every 20ms automatically
    }
}`}</CodeBlock>
                        <p>
                            Key features:
                        </p>
                        <ul>
                            <li>Automatically registers with the <code>CommandScheduler</code></li>
                            <li>Has a <code>periodic()</code> method called every 20ms (50Hz)</li>
                            <li>Can have a "default command" that runs when no other command is using it</li>
                        </ul>
                        <DocLink href="https://docs.wpilib.org/en/stable/docs/software/commandbased/subsystems.html">
                            WPILib Subsystems Docs →
                        </DocLink>
                    </ConceptCard>

                    <ConceptCard
                        title="What is TalonFX?"
                        emoji="⚡"
                    >
                        <p>
                            <code>TalonFX</code> is the motor controller class for CTRE's Falcon 500
                            and Kraken X60 motors. In Phoenix 6, it uses a "control request" pattern
                            where you create reusable request objects and apply them to the motor.
                        </p>
                        <p>
                            Common control modes:
                        </p>
                        <ul>
                            <li><strong>VoltageOut</strong> – Direct voltage control (simple)</li>
                            <li><strong>PositionVoltage</strong> – PID position control</li>
                            <li><strong>VelocityVoltage</strong> – PID velocity control</li>
                            <li><strong>MotionMagicVoltage</strong> – Smooth motion-profiled position control</li>
                        </ul>
                        <CodeBlock>{`// Create a reusable control request
private final VoltageOut voltage = new VoltageOut(0);

// Apply it in periodic()
motor.setControl(voltage.withOutput(6.0)); // 6 volts`}</CodeBlock>
                        <DocLink href="https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/device-specific/talonfx/index.html">
                            CTRE TalonFX Docs →
                        </DocLink>
                    </ConceptCard>

                    <ConceptCard
                        title="What is Motion Magic?"
                        emoji="✨"
                    >
                        <p>
                            <strong>Motion Magic</strong> is CTRE's onboard motion profiling feature.
                            Instead of just commanding "go to position X," Motion Magic generates a
                            smooth trapezoidal (or S-curve) velocity profile automatically.
                        </p>
                        <p>
                            You configure three parameters:
                        </p>
                        <ul>
                            <li><strong>Cruise Velocity</strong> – Maximum speed during motion</li>
                            <li><strong>Acceleration</strong> – How fast to speed up/slow down</li>
                            <li><strong>Jerk</strong> (optional) – Smooths the acceleration curve</li>
                        </ul>
                        <p>
                            Benefits over raw position control:
                        </p>
                        <ul>
                            <li>Smoother motion, less mechanical stress</li>
                            <li>Better repeatability under varying battery voltage</li>
                            <li>Respects physical limits of your mechanism</li>
                        </ul>
                        <CodeBlock>{`// Configure in TalonFXConfiguration
config.MotionMagic.MotionMagicCruiseVelocity = 80; // rps
config.MotionMagic.MotionMagicAcceleration = 160;  // rps/s
config.MotionMagic.MotionMagicJerk = 1600;         // rps/s/s`}</CodeBlock>
                        <DocLink href="https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/device-specific/talonfx/motion-magic.html">
                            CTRE Motion Magic Docs →
                        </DocLink>
                    </ConceptCard>

                    <ConceptCard
                        title="What is periodic()?"
                        emoji="🔄"
                    >
                        <p>
                            The <code>periodic()</code> method is your subsystem's heartbeat. The
                            <code>CommandScheduler</code> calls it automatically every 20 milliseconds
                            (50 times per second).
                        </p>
                        <p>
                            Use it for:
                        </p>
                        <ul>
                            <li>Applying motor outputs (control requests)</li>
                            <li>Reading sensor values</li>
                            <li>Logging telemetry to SmartDashboard/Shuffleboard</li>
                            <li>Running state machines (like homing sequences)</li>
                        </ul>
                        <CodeBlock>{`@Override
public void periodic() {
    // Apply control
    motor.setControl(motionMagic.withPosition(targetAngle));
    
    // Log telemetry
    SmartDashboard.putNumber("Arm/Angle", getAngle());
}`}</CodeBlock>
                        <Hint>
                            Never put blocking code or long loops in <code>periodic()</code>.
                            It must complete quickly or you'll starve other subsystems!
                        </Hint>
                    </ConceptCard>

                    <ConceptCard
                        title="What is FOC?"
                        emoji="🧲"
                    >
                        <p>
                            <strong>FOC (Field-Oriented Control)</strong> is an advanced motor control
                            technique that provides better torque at low speeds and smoother operation
                            overall. In Phoenix 6, you enable it with <code>.withEnableFOC(true)</code>.
                        </p>
                        <p>
                            When to use FOC:
                        </p>
                        <ul>
                            <li>Mechanisms requiring precise low-speed control</li>
                            <li>Arms, elevators, and intakes</li>
                            <li>Any time you want maximum efficiency</li>
                        </ul>
                        <CodeBlock>{`// Enable FOC in your control request
motor.setControl(
    motionMagic.withPosition(target)
               .withEnableFOC(true)  // ← Enable FOC here
);`}</CodeBlock>
                        <DocLink href="https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/device-specific/talonfx/basic-control.html">
                            CTRE Basic Control Docs →
                        </DocLink>
                    </ConceptCard>
                </Section>

                {/* Architecture */}
                <Section title="Subsystem Architecture">
                    <p>Every WPILib subsystem follows this general structure:</p>
                    <CodeBlock>{`public class MySubsystem extends SubsystemBase {
    // 1️⃣ HARDWARE - Motors, sensors, pneumatics
    private final TalonFX motor;
    private final DigitalInput sensor;

    // 2️⃣ CONTROL REQUESTS - Reusable control objects
    private final MotionMagicVoltage motionMagic = new MotionMagicVoltage(0);

    // 3️⃣ STATE - Track what the subsystem is doing
    private Angle targetAngle = Degrees.of(0);

    // 4️⃣ CONSTRUCTOR - Initialize hardware, apply configs
    public MySubsystem() {
        motor = new TalonFX(port);
        // Apply configurations...
    }

    // 5️⃣ PERIODIC - Runs every 20ms
    @Override
    public void periodic() {
        motor.setControl(motionMagic.withPosition(targetAngle));
        SmartDashboard.putNumber("Angle", getAngle().in(Degrees));
    }

    // 6️⃣ PUBLIC METHODS - API for commands
    public void setTargetAngle(Angle angle) { ... }
    public Angle getAngle() { ... }

    // 7️⃣ COMMANDS - Return Command objects
    public Command goToAngleCommand(Angle angle) { ... }
}`}</CodeBlock>
                </Section>

                {/* Step 1 */}
                <Section title="Step 1: Declare Hardware">
                    <p>Start by declaring your motors and sensors as instance variables.</p>
                    <CodeBlock>{`private final TalonFX armMotor;
private final TalonFX rollerMotor;
private final DigitalInput coralSensor = new DigitalInput(Ports.INTAKE_BREAK);`}</CodeBlock>
                    <Hint>
                        We use <code>TalonFX</code> for Falcon 500 / Kraken motors and{" "}
                        <code>DigitalInput</code> for beam-break sensors. The sensor is
                        initialized inline because its port is constant.
                    </Hint>
                </Section>

                {/* Step 2 */}
                <Section title="Step 2: Constructor – Initialize Motors">
                    <p>
                        In the constructor, create the motor objects and apply configurations.
                        Configurations define PID gains, current limits, and Motion Magic parameters.
                    </p>
                    <Challenge>
                        <p>
                            <strong>Your task:</strong> Initialize <code>armMotor</code> and{" "}
                            <code>rollerMotor</code> using the factory, then apply configurations.
                        </p>
                        <CodeBlock>{`public IntakeSkeleton() {
    // TODO: Create the motor instances
    armMotor = ???
    rollerMotor = ???

    // TODO: Apply motor configurations
}`}</CodeBlock>
                        <Solution>
                            <CodeBlock>{`public Intake() {
    armMotor = TalonFXFactory.createDefaultTalon(Ports.INTAKE_ARM);
    rollerMotor = TalonFXFactory.createDefaultTalon(Ports.INTAKE_ROLLERS);

    TalonUtil.applyAndCheckConfiguration(armMotor, IntakeConstants.getArmConfig());
    TalonUtil.applyAndCheckConfiguration(rollerMotor, IntakeConstants.getRollerConfig());
}`}</CodeBlock>
                            <Hint>
                                <code>TalonFXFactory</code> is a Team 254 helper that creates motors
                                with sensible defaults. <code>TalonUtil.applyAndCheckConfiguration</code>
                                applies a config and verifies it was successful.
                            </Hint>
                        </Solution>
                    </Challenge>
                </Section>

                {/* Step 3 */}
                <Section title="Step 3: periodic() – The Control Loop">
                    <p>
                        The <code>periodic()</code> method runs every 20ms. This is where
                        you read sensors, apply motor outputs, and log telemetry.
                    </p>
                    <InfoBox>
                        <strong>Important:</strong> In Phoenix 6, you apply control using the
                        "control request" pattern. Create a <code>MotionMagicVoltage</code> object
                        once, then reuse it with <code>.withPosition()</code> each loop.
                    </InfoBox>
                    <Challenge>
                        <p>
                            <strong>Your task:</strong> Apply Motion Magic control to move the
                            arm to <code>targetAngle</code>.
                        </p>
                        <CodeBlock>{`@Override
public void periodic() {
    // TODO: Apply motion magic control to armMotor
    
    // TODO: Log position to SmartDashboard
}`}</CodeBlock>
                        <Solution>
                            <CodeBlock>{`@Override
public void periodic() {
    armMotor.setControl(
        motionMagic.withPosition(targetAngle)
                   .withSlot(0)        // Use PID gains from slot 0
                   .withEnableFOC(true) // Enable Field-Oriented Control
    );

    SmartDashboard.putNumber("Intake/Position", getAngle().in(Degrees));
    SmartDashboard.putNumber("Intake/Goal_Deg", targetAngle.in(Degrees));
}`}</CodeBlock>
                        </Solution>
                    </Challenge>
                </Section>

                {/* Step 4 */}
                <Section title="Step 4: Sensor Getters">
                    <p>
                        Provide methods to read sensor values. These abstract the hardware details
                        so other code doesn't need to know about Phoenix 6 StatusSignals.
                    </p>
                    <Challenge>
                        <p>
                            <strong>Your task:</strong> Implement <code>getAngle()</code> and{" "}
                            <code>hasCoral()</code>.
                        </p>
                        <CodeBlock>{`public Angle getAngle() {
    // TODO: Return arm position from motor
}

public boolean hasCoral() {
    // TODO: Return true when beam is broken
    // Hint: The sensor returns FALSE when broken!
}`}</CodeBlock>
                        <Solution>
                            <CodeBlock>{`public Angle getAngle() {
    return armMotor.getPosition().getValue();
}

public boolean hasCoral() {
    return !coralSensor.get(); // Inverted!
}`}</CodeBlock>
                            <Hint>
                                <code>getPosition()</code> returns a <code>StatusSignal&lt;Angle&gt;</code>.
                                Call <code>.getValue()</code> to get the actual measurement.
                            </Hint>
                        </Solution>
                    </Challenge>
                </Section>

                {/* Step 5 */}
                <Section title="Step 5: Roller Control">
                    <p>
                        The rollers use simple voltage control – no fancy Motion Magic needed.
                        Just set a voltage and the motor spins at that power.
                    </p>
                    <Challenge>
                        <p>
                            <strong>Your task:</strong> Implement <code>startRollers()</code>,{" "}
                            <code>stopRollers()</code>, and <code>reverseRollers()</code>.
                        </p>
                        <CodeBlock>{`public void startRollers() {
    // TODO
}

public void stopRollers() {
    // TODO
}

public void reverseRollers() {
    // TODO
}`}</CodeBlock>
                        <Solution>
                            <CodeBlock>{`public void startRollers() {
    rollerMotor.setVoltage(IntakeConstants.ROLLER_SPEED.in(Volts));
    rollersRunning = true;
}

public void stopRollers() {
    rollerMotor.stopMotor();
    rollersRunning = false;
}

public void reverseRollers() {
    rollerMotor.setVoltage(IntakeConstants.ROLLER_REVERSE_SPEED.in(Volts));
    rollersRunning = true;
}`}</CodeBlock>
                        </Solution>
                    </Challenge>
                </Section>

                {/* Step 6 */}
                <Section title="Step 6: Commands">
                    <p>
                        Commands are the standard way to trigger subsystem actions in WPILib.
                        They can be chained with <code>.andThen()</code>, run in parallel with{" "}
                        <code>.alongWith()</code>, and interrupted at any time.
                    </p>
                    <InfoBox>
                        <strong>Command factories:</strong> SubsystemBase provides helper methods
                        to create commands:
                        <ul>
                            <li><code>run(Runnable)</code> – Runs continuously</li>
                            <li><code>runOnce(Runnable)</code> – Runs once then finishes</li>
                            <li><code>.until(BooleanSupplier)</code> – Ends when condition is true</li>
                            <li><code>.andThen(Command)</code> – Chains commands sequentially</li>
                        </ul>
                    </InfoBox>
                    <Challenge>
                        <p>
                            <strong>Your task:</strong> Implement <code>autoIntakeCommand()</code>{" "}
                            that:
                        </p>
                        <ol>
                            <li>Deploys the intake (arm down + start rollers)</li>
                            <li>Waits until coral is detected</li>
                            <li>Stows the intake (arm up + stop rollers)</li>
                        </ol>
                        <CodeBlock>{`public Command autoIntakeCommand() {
    // TODO: Chain commands together
}`}</CodeBlock>
                        <Solution>
                            <CodeBlock>{`public Command autoIntakeCommand() {
    return runOnce(this::deploy)
        .andThen(run(() -> {}).until(this::hasCoral))
        .andThen(runOnce(this::stow));
}`}</CodeBlock>
                            <Hint>
                                The middle command <code>run(() -&gt; &#123;&#125;).until(...)</code> is
                                a "wait until" pattern – it does nothing but keeps running until coral is detected.
                            </Hint>
                        </Solution>
                    </Challenge>
                </Section>

                {/* Summary */}
                <Section title="Summary">
                    <p>You now know how to build a complete FRC subsystem! Key takeaways:</p>
                    <ul>
                        <li>
                            <code>SubsystemBase</code> encapsulates hardware and provides a control API
                        </li>
                        <li>
                            <code>periodic()</code> is your control loop – runs every 20ms
                        </li>
                        <li>
                            <strong>Motion Magic</strong> provides smooth, repeatable motion profiling
                        </li>
                        <li>
                            Sensor getters abstract hardware details (StatusSignals, inversion)
                        </li>
                        <li>
                            Commands let you compose complex behaviors with <code>.andThen()</code>
                        </li>
                    </ul>
                </Section>

                {/* Further Reading */}
                <Section title="Further Reading">
                    <ul>
                        <li>
                            <ExternalLink href="https://docs.wpilib.org/en/stable/docs/software/commandbased/index.html">
                                WPILib Command-Based Programming Guide
                            </ExternalLink>
                        </li>
                        <li>
                            <ExternalLink href="https://v6.docs.ctr-electronics.com/en/stable/">
                                CTRE Phoenix 6 Documentation
                            </ExternalLink>
                        </li>
                        <li>
                            <ExternalLink href="https://github.com/CrossTheRoadElec/Phoenix6-Examples">
                                Phoenix 6 Example Projects (GitHub)
                            </ExternalLink>
                        </li>
                        <li>
                            <ExternalLink href="https://docs.wpilib.org/en/stable/docs/software/basic-programming/java-units.html">
                                WPILib Units Library Guide
                            </ExternalLink>
                        </li>
                    </ul>
                </Section>

                {/* Footer */}
                <footer className={styles.footer}>
                    <Link href="/students" className={styles.backNav}>
                        <span>←</span> Back to Resources
                    </Link>
                </footer>
            </article>
        </main>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{title}</h2>
            <div className={styles.sectionContent}>{children}</div>
        </section>
    );
}

function CodeBlock({ children }: { children: string }) {
    return (
        <pre className={styles.codeBlock}>
            <code>{children}</code>
        </pre>
    );
}

function Hint({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.hint}>
            <strong>💡 Hint:</strong> {children}
        </div>
    );
}

function InfoBox({ children }: { children: React.ReactNode }) {
    return <div className={styles.infoBox}>{children}</div>;
}

function Challenge({ children }: { children: React.ReactNode }) {
    return <div className={styles.challenge}>{children}</div>;
}

function Solution({ children }: { children: React.ReactNode }) {
    return (
        <details className={styles.solution}>
            <summary className={styles.solutionToggle}>Show Solution</summary>
            <div className={styles.solutionContent}>{children}</div>
        </details>
    );
}

function ConceptCard({
    title,
    emoji,
    children,
}: {
    title: string;
    emoji: string;
    children: React.ReactNode;
}) {
    return (
        <div className={styles.conceptCard}>
            <h3 className={styles.conceptTitle}>
                <span className={styles.conceptEmoji}>{emoji}</span> {title}
            </h3>
            <div className={styles.conceptContent}>{children}</div>
        </div>
    );
}

function DocLink({
    href,
    children,
}: {
    href: string;
    children: React.ReactNode;
}) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.docLink}
        >
            {children}
        </a>
    );
}

function ExternalLink({
    href,
    children,
}: {
    href: string;
    children: React.ReactNode;
}) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.externalLink}
        >
            {children}
        </a>
    );
}
