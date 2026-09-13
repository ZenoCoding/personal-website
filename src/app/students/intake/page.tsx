import { Metadata } from "next";
import Link from "next/link";
import styles from "./Intake.module.css";
import CodeBlock from "./CodeBlock";
import LessonNav from "./LessonNav";
import Quiz from "./Quiz";

const lessonSections = [
    { id: "intro", label: "Overview" },
    { id: "prereqs", label: "Prerequisites" },
    { id: "concepts", label: "Key Concepts" },
    { id: "architecture", label: "Architecture" },
    { id: "setup", label: "Project Setup" },
    { id: "constants", label: "Constants" },
    { id: "step1", label: "1. Hardware" },
    { id: "step2", label: "2. Constructor" },
    { id: "step3", label: "3. periodic()" },
    { id: "step4", label: "4. Sensors" },
    { id: "step5", label: "5. Rollers" },
    { id: "step6", label: "6. Commands" },
    { id: "summary", label: "Summary" },
];

export const metadata: Metadata = {
    title: "FRC Intake Subsystem | Student Resources",
    description: "Learn to write a WPILib subsystem for an FRC intake mechanism.",
    robots: { index: false, follow: false },
};

export default function IntakeLessonPage() {
    return (
        <main className={styles.page}>
            <LessonNav sections={lessonSections} />
            <article className={styles.article}>
                {/* Header */}
                <Link href="/students" className={styles.backNav}>
                    <span>←</span> Back to Resources
                </Link>

                <header className={styles.header}>
                    <h1 className={styles.title}>Building an Intake Subsystem</h1>
                    <p className={styles.subtitle}>
                        Build the code for a real two-motor intake: a pivoting arm, a roller,
                        and a beam-break sensor. You’ll write each part, then use a sensor and a button to make them work together.
                    </p>

                    <div className={styles.lessonMeta}>
                        <span className={`${styles.difficultyBadge} ${styles.intermediate}`}>
                            Intermediate
                        </span>
                        <div className={styles.learningTags}>
                            <span className={styles.tag}>SubsystemBase</span>
                            <span className={styles.tag}>TalonFX</span>
                            <span className={styles.tag}>Motion Magic</span>
                            <span className={styles.tag}>Commands</span>
                            <span className={styles.tag}>Sensors</span>
                        </div>
                    </div>

                    <div className={styles.downloadButtons}>
                        <a
                            href="/lessons/intake/IntakeSkeleton.java"
                            download
                            className={`${styles.downloadBtn} ${styles.downloadBtnPrimary}`}
                        >
                            ↓ Starter Code
                        </a>
                        <a
                            href="/lessons/intake/IntakeConstants.java"
                            download
                            className={`${styles.downloadBtn} ${styles.downloadBtnSecondary}`}
                        >
                            ↓ Constants
                        </a>
                        <a
                            href="/lessons/intake/IntakeLessonSolution.java"
                            download
                            className={`${styles.downloadBtn} ${styles.downloadBtnSecondary}`}
                        >
                            ↓ Lesson Solution
                        </a>
                    </div>
                </header>

                {/* Intro */}
                <InfoBox>
                    <p>For the runnable laptop version, use <Link href="/students/projects/intake-practice">Practice an intake on your laptop</Link>. This walkthrough uses TalonFX motors; you can compile your work now and complete the physical checks when a robot is available.</p>
                </InfoBox>
                <Section id="intro" title="What You'll Build">
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
                    <figure className={styles.diagram}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/lessons/intake/intake-cad.png"
                            alt="CAD model of the intake mechanism showing arm and rollers"
                        />
                        <figcaption>CAD model of our intake – arm pivots down while rollers spin to grab game pieces</figcaption>
                    </figure>

                    <h3>By the end, you should be able to</h3>
                    <ul>
                        <li>Explain what belongs inside a subsystem and what belongs in a command.</li>
                        <li>Configure a TalonFX for mechanism units and Motion Magic.</li>
                        <li>Write hasCoral() so it returns true when the beam is blocked.</li>
                        <li>Build a command sequence that behaves safely when it is interrupted.</li>
                    </ul>

                    <InfoBox>
                        <p><strong>How to use this lesson:</strong> Download the starter and try the first unfinished method. Compile after each step. Compare your attempt with the solution if you get stuck, and ask about any difference you cannot explain. Complete the hardware checkpoint when the mechanism is available.</p>
                    </InfoBox>
                </Section>

                {/* Prerequisites */}
                <Section id="prereqs" title="Prerequisites & Resources">
                    <p>
                        You should already be comfortable with Java methods, instance variables, and basic
                        command-based robot code. Use the links below to look up the API calls as you encounter them.
                    </p>
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

                    <h3>1. Install the vendor libraries</h3>
                    <p>
                        This project uses Phoenix 6 for the TalonFX motors. The helper bundle below also contains
                        one compatibility utility that imports Phoenix 5, so install both vendordeps. In WPILib VS
                        Code, open the command palette, choose <strong>Manage Vendor Libraries</strong>, then
                        <strong>Install new libraries (online)</strong>.
                    </p>
                    <InfoBox>
                        <p><strong>Phoenix 6 (2026):</strong></p>
                        <CodeBlock language="text">{"https://maven.ctr-electronics.com/release/com/ctre/phoenix6/latest/Phoenix6-frc2026-latest.json"}</CodeBlock>
                        <p><strong>Phoenix 5 (2026 compatibility library):</strong></p>
                        <CodeBlock language="text">{"https://maven.ctr-electronics.com/release/com/ctre/phoenix/Phoenix5-frc2026-latest.json"}</CodeBlock>
                    </InfoBox>

                    <h3>2. Install Team 254 Helper Library</h3>
                    <p>
                        Our codebase uses a few Team 254 helper classes to create motors with known defaults and
                        verify that configurations were actually applied. Install these helpers for the starter used in this lesson.
                    </p>
                    <div className={styles.downloadButtons} style={{ justifyContent: 'flex-start', margin: '1rem 0' }}>
                        <a
                            href="/lessons/lib/team254.zip"
                            download
                            className={`${styles.downloadBtn} ${styles.downloadBtnPrimary}`}
                        >
                            ↓ Download team254.zip
                        </a>
                    </div>
                    <p>
                        Extract this folder into your project so that it sits alongside your robot package.
                        Your file structure should look like this:
                    </p>
                    <CodeBlock>{`src/main/java/
├── com/
│   └── team254/lib/
│       ├── drivers/
│       │   ├── TalonFXFactory.java
│       │   └── ...
│       ├── geometry/
│       └── ...
└── frc/
    └── robot/
        ├── subsystems/
        └── Robot.java`}</CodeBlock>
                </Section>

                {/* Key Concepts */}
                <Section id="concepts" title="Key Concepts">
                    <ConceptCard title="Subsystems hide hardware details">
                        <p>
                            The Intake class stores the motor and sensor objects. Other robot code should ask it to
                            deploy, stow, or run the rollers without knowing CAN IDs, inversion, or how
                            the beam-break is wired.
                        </p>
                        <CodeBlock>{`public class Intake extends SubsystemBase {
    private final TalonFX motor = new TalonFX(1);

    @Override
    public void periodic() {
        // Read hardware and apply the current goal.
    }
}`}</CodeBlock>
                        <p>
                            <code>SubsystemBase</code> registers with the command scheduler. During the
                            normal robot loop, the scheduler calls <code>periodic()</code> and makes sure
                            two commands do not use the same subsystem at once.
                        </p>
                        <DocLink href="https://docs.wpilib.org/en/stable/docs/software/commandbased/subsystems.html">
                            WPILib subsystem documentation →
                        </DocLink>
                    </ConceptCard>

                    <ConceptCard title="Motion Magic runs on the motor controller">
                        <p>
                            A TalonFX can generate a motion profile and run its own position loop. We give
                            it a target using a reusable <code>MotionMagicVoltage</code> request instead of
                            calculating a new motor voltage in robot code every loop.
                        </p>
                        <CodeBlock>{`private final MotionMagicVoltage motionMagic =
    new MotionMagicVoltage(0);

motor.setControl(motionMagic.withPosition(targetAngle));`}</CodeBlock>
                        <p>
                            Cruise velocity limits speed; acceleration and jerk limit how quickly that speed changes. The constants section below gives the units for each value.
                        </p>
                        <DocLink href="https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/device-specific/talonfx/motion-magic.html">
                            CTRE Motion Magic documentation →
                        </DocLink>
                    </ConceptCard>

                    <ConceptCard title="Store one goal and update it every loop">
                        <p>
                            Commands change <code>targetAngle</code>. The subsystem&apos;s
                            <code>periodic()</code> method sends that goal to the controller and publishes
                            the measured position. Look here when the requested angle and the measured angle disagree.
                        </p>
                        <CodeBlock>{`@Override
public void periodic() {
    motor.setControl(motionMagic.withPosition(targetAngle));
    SmartDashboard.putNumber("Arm/Angle", getAngle());
}`}</CodeBlock>
                        <Hint>
                            Keep <code>periodic()</code> quick. A long loop or blocking call delays the
                            rest of the robot program.
                        </Hint>
                    </ConceptCard>
                </Section>

                <Quiz
                    question="Why store targetAngle instead of sending a position request only when a button is pressed?"
                    options={[
                        { text: "The TalonFX forgets every target after 20ms" },
                        { text: "Commands are not allowed to access subsystems" },
                        { text: "periodic() can consistently apply and log the subsystem's current goal", correct: true },
                        { text: "SmartDashboard requires a target variable" },
                    ]}
                    explanation="Commands update targetAngle. The subsystem sends that target to the motor controller in periodic() and records the measured angle."
                />

                {/* Architecture */}
                <Section id="architecture" title="Subsystem Architecture">
                    <p>This intake uses the following structure:</p>
                    <CodeBlock>{`public class MySubsystem extends SubsystemBase {
    // Hardware
    private final TalonFX motor;
    private final DigitalInput sensor;

    // Reusable control request
    private final MotionMagicVoltage motionMagic = new MotionMagicVoltage(0);

    // Desired state
    private Angle targetAngle = Degrees.of(0);

    // Initialize hardware and apply configuration
    public MySubsystem() {
        motor = new TalonFX(port);
        // Apply configurations...
    }

    // Apply the goal and publish useful measurements
    @Override
    public void periodic() {
        motor.setControl(motionMagic.withPosition(targetAngle));
        SmartDashboard.putNumber("Angle", getAngle().in(Degrees));
    }

    // Public API used by commands
    public void setTargetAngle(Angle angle) { ... }
    public Angle getAngle() { ... }

    // Commands built from that API
    public Command goToAngleCommand(Angle angle) { ... }
}`}</CodeBlock>
                </Section>

                {/* Project Setup */}
                <Section id="setup" title="Project Setup">
                    <p>
                        Put both files in the intake package:
                    </p>
                    <p><strong>Create these files in your project:</strong></p>
                    <CodeBlock>{`src/main/java/frc/robot/
└── subsystems/
    └── intake/
        ├── Intake.java      ← Main subsystem class
        └── IntakeConstants.java  ← Constants file`}</CodeBlock>
                    <p>
                        Download both files using the buttons above, or create them from scratch
                        following this lesson.
                    </p>
                </Section>

                {/* Constants */}
                <Section id="constants" title="Understanding IntakeConstants">
                    <p>
                        Keep the arm angles, gear ratio, and control gains in IntakeConstants.java. On another intake, you will need to check these values against its geometry and motors.
                    </p>

                    <ConceptCard title="Arm positions">
                        <p>Define where the arm should be in different states:</p>
                        <CodeBlock>{`// Arm positions
public static final Angle RETRACTED_ANGLE = Units.Degrees.of(90);
public static final Angle DOWN_ANGLE = Units.Degrees.of(-32);`}</CodeBlock>
                        <Hint>
                            WPILib&apos;s <code>Units</code> types make degrees and rotations harder to
                            mix up by accident.
                        </Hint>
                    </ConceptCard>

                    <ConceptCard title="Motion profile">
                        <p>Motion Magic uses mechanism rotations once the gear ratio is configured:</p>
                        <CodeBlock>{`// Motion control
public static final double CRUISE_VELOCITY = 2;  // mechanism rotations/s
public static final double ACCELERATION = 15;   // mechanism rotations/s²
public static final double JERK = 0;            // mechanism rotations/s³`}</CodeBlock>
                        <p>
                            <strong>Cruise velocity</strong> is the max speed. <strong>Acceleration</strong> controls
                            how quickly the profile changes speed. <strong>Jerk</strong> limits how quickly
                            acceleration changes; zero selects a trapezoidal profile.
                        </p>
                        <InfoBox>
                            <p>
                                These are not degrees per second. With
                                <code> SensorToMechanismRatio</code> set, Phoenix reports and accepts
                                mechanism rotations. A cruise velocity of 2 means up to two arm
                                rotations per second.
                            </p>
                        </InfoBox>
                    </ConceptCard>

                    <ConceptCard title="Arm motor configuration">
                        <p>The <code>getArmConfig()</code> method builds the TalonFX configuration:</p>
                        <CodeBlock>{`public static TalonFXConfiguration getArmConfig() {
    TalonFXConfiguration config = new TalonFXConfiguration();
    
    // Motion Magic parameters
    config.MotionMagic.MotionMagicCruiseVelocity = CRUISE_VELOCITY;
    config.MotionMagic.MotionMagicAcceleration = ACCELERATION;
    
    // PID + Feedforward gains
    config.Slot0.kP = 15;    // Proportional gain
    config.Slot0.kG = 0.31;  // Gravity compensation (for arms!)
    config.Slot0.GravityType = GravityTypeValue.Arm_Cosine;
    
    // Gear ratio (motor rotations → mechanism rotations)
    config.Feedback.SensorToMechanismRatio = GEAR_RATIO;
    
    // Safety limits
    config.CurrentLimits.StatorCurrentLimit = 40;
    config.CurrentLimits.StatorCurrentLimitEnable = true;
    
    return config;
}`}</CodeBlock>
                        <Hint>
                            <code>kG</code> adds voltage to counter gravity.
                            <code>Arm_Cosine</code> changes that feedforward with the arm angle.
                        </Hint>
                        <p>
                            The gains shown here were chosen for this intake. Start cautiously and
                            retune them if the mass, gearing, motor, or geometry changes.
                        </p>
                    </ConceptCard>

                    <ConceptCard title="Roller motor configuration">
                        <p>The roller only needs voltage control, braking, and a current limit:</p>
                        <CodeBlock>{`public static TalonFXConfiguration getRollerConfig() {
    TalonFXConfiguration config = new TalonFXConfiguration();
    config.MotorOutput.NeutralMode = NeutralModeValue.Brake;
    config.CurrentLimits.StatorCurrentLimit = 25;
    config.CurrentLimits.StatorCurrentLimitEnable = true;
    return config;
}`}</CodeBlock>
                    </ConceptCard>
                </Section>

                {/* Step 1 */}
                <Section id="step1" title="Step 1: Declare Hardware">
                    <InfoBox>
                        <p><strong>Before enabling:</strong> Put the robot on blocks, clear the mechanism,
                            check the CAN IDs and sensor port, and keep one person ready to disable.
                            Make the first movement with the arm supported and away from its hard stops.</p>
                    </InfoBox>
                    <p>Start by declaring your motors and sensors as instance variables.</p>
                    <CodeBlock>{`private final TalonFX armMotor;
private final TalonFX rollerMotor;
private final DigitalInput coralSensor = new DigitalInput(Ports.INTAKE_BREAK);`}</CodeBlock>
                    <Hint>
                        We use <code>TalonFX</code> for Falcon 500 or Kraken motors and{" "}
                        <code>DigitalInput</code> for beam-break sensors. The sensor is
                        initialized inline because its port is constant.
                    </Hint>
                </Section>

                {/* Step 2 */}
                <Section id="step2" title="Step 2: Constructor – Initialize Motors">
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
                            <CodeBlock>{`public IntakeSkeleton() {
    armMotor = TalonFXFactory.createDefaultTalon(Ports.INTAKE_ARM);
    rollerMotor = TalonFXFactory.createDefaultTalon(Ports.INTAKE_ROLLERS);

    TalonUtil.applyAndCheckConfiguration(armMotor, IntakeConstants.getArmConfig());
    TalonUtil.applyAndCheckConfiguration(rollerMotor, IntakeConstants.getRollerConfig());
}`}</CodeBlock>
                            <Hint>
                                <code>TalonFXFactory</code> is a Team 254 helper that creates the TalonFX objects. <code>TalonUtil.applyAndCheckConfiguration</code>
                                applies a config and verifies it was successful.
                            </Hint>
                        </Solution>
                    </Challenge>
                    <InfoBox>
                        <p><strong>Checkpoint:</strong> Build the project. With the robot disabled,
                            confirm that both motors appear on the CAN bus and that the configuration
                            helper reports no errors. Do not continue until the IDs match the constants.</p>
                    </InfoBox>
                </Section>

                {/* Step 3 */}
                <Section id="step3" title="Step 3: periodic() – The Control Loop">
                    <p>
                        The <code>periodic()</code> method runs every 20ms. This is where
                        you read sensors, apply motor outputs, and log telemetry.
                    </p>
                    <InfoBox>
                        In Phoenix 6, create a <code>MotionMagicVoltage</code> request once, then reuse
                        it with <code>.withPosition()</code> each loop.
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
                   .withSlot(0)
    );

    SmartDashboard.putNumber("Intake/Position", getAngle().in(Degrees));
    SmartDashboard.putNumber("Intake/Goal_Deg", targetAngle.in(Degrees));
}`}</CodeBlock>
                        </Solution>
                    </Challenge>
                    <InfoBox>
                        <p><strong>Checkpoint:</strong> With the arm supported, command a small change in
                            target and watch <code>Intake/Position</code> and <code>Intake/Goal_Deg</code>.
                            If the measured angle moves away from the goal, disable immediately and fix
                            inversion or sensor direction before changing PID gains.</p>
                    </InfoBox>
                </Section>

                <Quiz
                    question="The arm moves away from its goal as soon as you enable it. What should you do first?"
                    options={[
                        { text: "Increase kP so it reaches the goal faster" },
                        { text: "Disable and correct motor or sensor inversion", correct: true },
                        { text: "Negate every requested angle" },
                        { text: "Increase the current limit" },
                    ]}
                    explanation="Positive feedback can drive an arm into a hard stop. Fix the sign convention before tuning gains or trying another target."
                />

                {/* Step 4 */}
                <Section id="step4" title="Step 4: Sensor Getters">
                    <p>
                        Name the getter <code>hasCoral()</code> and return true when a piece blocks the beam. The sensor returns false in that case, so the getter will invert its value.
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
    // This sensor returns false when the beam is broken.
}`}</CodeBlock>
                        <Solution>
                            <CodeBlock>{`public Angle getAngle() {
    return armMotor.getPosition().getValue();
}

public boolean hasCoral() {
    return !coralSensor.get();
}`}</CodeBlock>
                            <Hint>
                                <code>getPosition()</code> returns a <code>StatusSignal&lt;Angle&gt;</code>.
                                Call <code>.getValue()</code> to get the actual measurement.
                            </Hint>
                        </Solution>
                    </Challenge>
                    <InfoBox>
                        <p><strong>Checkpoint:</strong> Publish <code>hasCoral()</code> to the dashboard.
                            Block and unblock the beam by hand while the robot is disabled. The value
                            should be true only while the beam is blocked.</p>
                    </InfoBox>
                    <CodeBlock>{`SmartDashboard.putBoolean("Intake/Has_Coral", hasCoral());`}</CodeBlock>
                </Section>

                {/* Step 5 */}
                <Section id="step5" title="Step 5: Roller Control">
                    <p>
                        The rollers use direct voltage control. Write one method for each action: start, stop, and reverse.
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
                    <InfoBox>
                        <p><strong>Checkpoint:</strong> Keep the intake off the floor. Start, stop, and
                            reverse the roller separately. Verify its direction and begin with a lower
                            voltage if the mechanism has not been tested before.</p>
                    </InfoBox>
                </Section>

                {/* Step 6 */}
                <Section id="step6" title="Step 6: Commands">
                    <p>
                        Now combine the methods into one behavior. The command must also leave the intake
                        safe if the driver cancels it or another command interrupts it.
                    </p>
                    <InfoBox>
                        <strong>The pieces used here:</strong>
                        <ul>
                            <li><code>runOnce(Runnable)</code> runs an intake action once.</li>
                            <li><code>Commands.waitUntil(...)</code> waits for the sensor.</li>
                            <li><code>.andThen(...)</code> runs the steps in order.</li>
                            <li><code>.finallyDo(...)</code> cleans up after completion or interruption.</li>
                        </ul>
                    </InfoBox>
                    <Challenge>
                        <p>
                            <strong>Your task:</strong> Finish the small methods that change the arm
                            goal and combine arm and roller actions.
                        </p>
                        <Solution>
                            <CodeBlock>{`public void setTargetAngle(Angle angle) {
    targetAngle = angle;
}

public void deploy() {
    setTargetAngle(IntakeConstants.DOWN_ANGLE);
    startRollers();
}

public void stow() {
    setTargetAngle(IntakeConstants.RETRACTED_ANGLE);
    stopRollers();
}

public Command getMoveToAngleCommand(Angle angle) {
    return runOnce(() -> setTargetAngle(angle))
        .andThen(Commands.waitUntil(
            () -> Math.abs(
                getAngle().in(Degrees) - angle.in(Degrees)
            ) <= 2.0
        ));
}`}</CodeBlock>
                        </Solution>
                    </Challenge>
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
        .andThen(Commands.waitUntil(this::hasCoral))
        .andThen(runOnce(this::stow))
        .finallyDo(interrupted -> stopRollers());
}`}</CodeBlock>
                            <Hint>
                                Add <code>import edu.wpi.first.wpilibj2.command.Commands;</code>.
                                Without the cleanup, canceling while the command is waiting can leave
                                the roller running.
                            </Hint>
                        </Solution>
                    </Challenge>
                    <InfoBox>
                        <p><strong>Checkpoint:</strong> Run the command once with a game piece, then run
                            it again and cancel before the sensor trips. The roller should stop in both
                            cases. Also verify that blocking the sensor causes the intake to stow.</p>
                    </InfoBox>
                </Section>

                {/* Summary */}
                <Section id="summary" title="Demonstrate your intake">
                    <p>Bring the completed intake to code review. With hardware available, demonstrate these behaviors:</p>
                    <ul>
                        <li>Show the dashboard value changing when the beam is blocked.</li>
                        <li>Show the arm reaching both goals without hitting a hard stop.</li>
                        <li>Cancel auto-intake midway and show that the roller stops.</li>
                        <li>Identify which gains, limits, and ratios would need retuning on another robot.</li>
                    </ul>
                </Section>

                <p>Next: <Link href="/students/projects/elevator">write an elevator subsystem</Link> using what you learned here.</p>

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
    id,
    title,
    children,
}: {
    id?: string;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section id={id} className={styles.section}>
            <h2 className={styles.sectionTitle}>{title}</h2>
            <div className={styles.sectionContent}>{children}</div>
        </section>
    );
}

function Hint({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.hint}>
            <strong>Hint:</strong> {children}
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
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className={styles.conceptCard}>
            <h3 className={styles.conceptTitle}>{title}</h3>
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
