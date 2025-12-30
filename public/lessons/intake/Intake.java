package com.team9470.subsystems.intake;

import com.ctre.phoenix6.controls.MotionMagicVoltage;
import com.ctre.phoenix6.controls.VoltageOut;
import com.ctre.phoenix6.hardware.TalonFX;
import com.team254.lib.drivers.TalonFXFactory;
import com.team254.lib.drivers.TalonUtil;
import com.team9470.Ports;
import edu.wpi.first.units.measure.*;
import edu.wpi.first.wpilibj.DigitalInput;
import edu.wpi.first.wpilibj.Timer;
import edu.wpi.first.wpilibj.smartdashboard.SmartDashboard;
import edu.wpi.first.wpilibj2.command.Command;
import edu.wpi.first.wpilibj2.command.SubsystemBase;

import static edu.wpi.first.units.Units.*;

/**
 * Simplified Intake subsystem for the 2025 FRC Reefscape game.
 * 
 * This version removes the PeriodicIO abstraction for clarity while
 * maintaining identical functionality.
 */
public class Intake extends SubsystemBase {

    // ═══════════════════════════════════════════════════════════════════════
    // HARDWARE
    // ═══════════════════════════════════════════════════════════════════════
    private final TalonFX armMotor;
    private final TalonFX rollerMotor;
    private final DigitalInput coralSensor = new DigitalInput(Ports.INTAKE_BREAK);

    // ═══════════════════════════════════════════════════════════════════════
    // CONTROL REQUESTS
    // ═══════════════════════════════════════════════════════════════════════
    private final MotionMagicVoltage motionMagic = new MotionMagicVoltage(0);
    private final VoltageOut homingVoltage = new VoltageOut(IntakeConstants.HOMING_OUTPUT);

    // ═══════════════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════════════
    private enum HomingState {
        IDLE, HOMING, HOMED
    }

    private HomingState homingState = HomingState.HOMING;
    private boolean needsHoming = true;
    private double homingStartTime = 0;

    private Angle targetAngle = IntakeConstants.RETRACTED_ANGLE;
    private boolean rollersRunning = false;
    private boolean isDown = false;

    // ═══════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════════════
    public Intake() {
        armMotor = TalonFXFactory.createDefaultTalon(Ports.INTAKE_ARM);
        rollerMotor = TalonFXFactory.createDefaultTalon(Ports.INTAKE_ROLLERS);

        TalonUtil.applyAndCheckConfiguration(armMotor, IntakeConstants.getArmConfig());
        TalonUtil.applyAndCheckConfiguration(rollerMotor, IntakeConstants.getRollerConfig());
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PERIODIC (runs every 20ms)
    // ═══════════════════════════════════════════════════════════════════════
    @Override
    public void periodic() {
        // Run homing state machine if needed
        if (needsHoming) {
            runHomingStateMachine();
        }

        // Apply motor outputs
        if (homingState == HomingState.HOMING) {
            armMotor.setControl(homingVoltage);
        } else {
            armMotor.setControl(
                    motionMagic.withPosition(targetAngle)
                            .withSlot(0)
                            .withEnableFOC(true));
        }

        // Log telemetry
        SmartDashboard.putNumber("Intake/Position", getAngle().in(Degrees));
        SmartDashboard.putString("Intake/HomingState", homingState.name());
        SmartDashboard.putNumber("Intake/Goal_Deg", targetAngle.in(Degrees));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // HOMING STATE MACHINE
    // ═══════════════════════════════════════════════════════════════════════
    private void runHomingStateMachine() {
        Angle currentPosition = getAngle();
        AngularVelocity currentVelocity = getAngularVelocity();
        Current currentCurrent = getArmCurrent();
        double now = Timer.getFPGATimestamp();

        switch (homingState) {
            case IDLE:
                // Check if we should start homing
                boolean timedOut = (now - homingStartTime) > IntakeConstants.HOMING_TIMEOUT.in(Seconds);
                boolean nearHomingAngle = IntakeConstants.HOMING_ANGLE.isNear(currentPosition, Degrees.of(5));
                if (nearHomingAngle && timedOut) {
                    homingState = HomingState.HOMING;
                    homingStartTime = now;
                }
                break;

            case HOMING:
                // Check if we've hit the hard stop
                boolean velocityStalled = Math.abs(currentVelocity.in(DegreesPerSecond)) < 0.5;
                boolean currentHigh = currentCurrent.gte(IntakeConstants.HOMING_THRESHOLD);
                if (velocityStalled && currentHigh) {
                    armMotor.setPosition(IntakeConstants.HOMING_ANGLE);
                    homingState = HomingState.HOMED;
                }
                break;

            case HOMED:
                needsHoming = false;
                homingState = HomingState.IDLE;
                break;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SENSOR GETTERS
    // ═══════════════════════════════════════════════════════════════════════
    public Angle getAngle() {
        return armMotor.getPosition().getValue();
    }

    public AngularVelocity getAngularVelocity() {
        return armMotor.getVelocity().getValue();
    }

    public Current getArmCurrent() {
        return armMotor.getStatorCurrent().getValue();
    }

    public boolean hasCoral() {
        return !coralSensor.get(); // Inverted: true when beam is broken
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ARM CONTROL
    // ═══════════════════════════════════════════════════════════════════════
    public void setTargetAngle(Angle angle) {
        targetAngle = angle;
        isDown = angle.equals(IntakeConstants.DOWN_ANGLE);
    }

    public void triggerHoming() {
        needsHoming = true;
        homingState = HomingState.HOMING;
        homingStartTime = Timer.getFPGATimestamp();
    }

    public boolean isDown() {
        return isDown;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ROLLER CONTROL
    // ═══════════════════════════════════════════════════════════════════════
    public void startRollers() {
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
    }

    public boolean areRollersRunning() {
        return rollersRunning;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // COMPOUND ACTIONS
    // ═══════════════════════════════════════════════════════════════════════
    public void deploy() {
        setTargetAngle(IntakeConstants.DOWN_ANGLE);
        startRollers();
    }

    public void stow() {
        setTargetAngle(IntakeConstants.RETRACTED_ANGLE);
        stopRollers();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // COMMANDS
    // ═══════════════════════════════════════════════════════════════════════
    public Command getMoveToAngleCommand(Angle angle) {
        return run(() -> setTargetAngle(angle))
                .until(() -> getAngle().isNear(angle, Degrees.of(2)));
    }

    public Command getHomingCommand() {
        return runOnce(this::triggerHoming)
                .andThen(run(() -> {
                }).until(() -> homingState == HomingState.HOMED));
    }

    public Command deployCommand() {
        return runOnce(this::deploy);
    }

    public Command stowCommand() {
        return runOnce(this::stow);
    }

    public Command autoIntakeCommand() {
        return deployCommand()
                .andThen(run(() -> {
                }).until(this::hasCoral))
                .andThen(stowCommand());
    }

    public Command runRollersCommand() {
        return run(this::startRollers);
    }

    public Command stopRollersCommand() {
        return runOnce(this::stopRollers);
    }

    public Command reverseRollersCommand() {
        return run(this::reverseRollers);
    }

    public Command retractCommand() {
        return getMoveToAngleCommand(IntakeConstants.RETRACTED_ANGLE);
    }

    public Command goDownCommand() {
        return getMoveToAngleCommand(IntakeConstants.DOWN_ANGLE);
    }
}
