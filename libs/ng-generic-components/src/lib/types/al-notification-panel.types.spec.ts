/**
 * Test suite for the al-notification-panel.type
 *
 * @author Juan Leon <jleon@alertlogic.com>
 * @copyright Alert Logic, Inc 2018
 */

import { AlNotification, AlNotificationType } from './al-notification-panel.types';

describe('ModalCardDescriptor Class', () => {

    describe('WHEN the class AlNotification is created', () => {
        it('SHOULD match with initial type and the defined attributes', () => {
            let notification: AlNotification = new AlNotification('text');

            expect(notification.text).toBeDefined();
            expect(notification.icon).toBeDefined();
            expect(notification.type).toBeDefined();
            expect(notification.flush).toBeDefined();
            expect(notification.buttonText).toBeDefined();
        });
    });

    describe('WHEN the info() static method is called', () => {
        let notification: AlNotification = AlNotification.info('text', 1000, true, 'home', 'button text');
        let notificationWithoutParameters: AlNotification = AlNotification.info('text');
        it('SHOULD match with initial types and values', () => {

            expect(notification.text).toBeDefined();
            expect(notification.icon).toBeDefined();
            expect(notification.type).toBeDefined();
            expect(notification.flush).toBeDefined();
            expect(notification.buttonText).toBeDefined();
            expect(notification.autoDismiss).toBeDefined();
            expect(notification.text).toEqual('text');
            expect(notification.icon).toEqual('home');
            expect(notification.type).toEqual(AlNotificationType.Information);
            expect(notification.flush).toEqual(true);
            expect(notification.buttonText).toEqual('button text');
            expect(notification.autoDismiss).toEqual(1000);
        });
        it('SHOULD match with initial types and values without parameters', () => {

            expect(notificationWithoutParameters.text).toBeDefined();
            expect(notificationWithoutParameters.icon).toBeDefined();
            expect(notificationWithoutParameters.type).toBeDefined();
            expect(notificationWithoutParameters.flush).toBeDefined();
            expect(notificationWithoutParameters.buttonText).toBeDefined();
            expect(notificationWithoutParameters.autoDismiss).toBeUndefined();
            expect(notificationWithoutParameters.text).toEqual('text');
            expect(notificationWithoutParameters.icon).toEqual('');
            expect(notificationWithoutParameters.type).toEqual(AlNotificationType.Information);
            expect(notificationWithoutParameters.flush).toEqual(false);
            expect(notificationWithoutParameters.buttonText).toEqual('');
        });
    });

    describe('WHEN the warning() static method is called', () => {
        let notification: AlNotification = AlNotification.warning('text', 1000, true, 'home', 'button text');
        let notificationWithoutParameters: AlNotification = AlNotification.warning('text');
        it('SHOULD match with initial types and values', () => {

            expect(notification.text).toBeDefined();
            expect(notification.icon).toBeDefined();
            expect(notification.type).toBeDefined();
            expect(notification.flush).toBeDefined();
            expect(notification.buttonText).toBeDefined();
            expect(notification.autoDismiss).toBeDefined();
            expect(notification.text).toEqual('text');
            expect(notification.icon).toEqual('home');
            expect(notification.type).toEqual(AlNotificationType.Warning);
            expect(notification.flush).toEqual(true);
            expect(notification.buttonText).toEqual('button text');
            expect(notification.autoDismiss).toEqual(1000);
        });
        it('SHOULD match with initial types and values without parameters', () => {

            expect(notificationWithoutParameters.text).toBeDefined();
            expect(notificationWithoutParameters.icon).toBeDefined();
            expect(notificationWithoutParameters.type).toBeDefined();
            expect(notificationWithoutParameters.flush).toBeDefined();
            expect(notificationWithoutParameters.buttonText).toBeDefined();
            expect(notificationWithoutParameters.autoDismiss).toBeUndefined();
            expect(notificationWithoutParameters.text).toEqual('text');
            expect(notificationWithoutParameters.icon).toEqual('');
            expect(notificationWithoutParameters.type).toEqual(AlNotificationType.Warning);
            expect(notificationWithoutParameters.flush).toEqual(false);
            expect(notificationWithoutParameters.buttonText).toEqual('');
        });
    });

    describe('WHEN the error() static method is called', () => {
        let notification: AlNotification = AlNotification.error('text', 1000, true, 'home', 'button text');
        let notificationWithoutParameters: AlNotification = AlNotification.error('text');
        it('SHOULD match with initial types and values', () => {

            expect(notification.text).toBeDefined();
            expect(notification.icon).toBeDefined();
            expect(notification.type).toBeDefined();
            expect(notification.flush).toBeDefined();
            expect(notification.buttonText).toBeDefined();
            expect(notification.autoDismiss).toBeDefined();
            expect(notification.text).toEqual('text');
            expect(notification.icon).toEqual('home');
            expect(notification.type).toEqual(AlNotificationType.Error);
            expect(notification.flush).toEqual(true);
            expect(notification.buttonText).toEqual('button text');
            expect(notification.autoDismiss).toEqual(1000);
        });
        it('SHOULD match with initial types and values without parameters', () => {

            expect(notificationWithoutParameters.text).toBeDefined();
            expect(notificationWithoutParameters.icon).toBeDefined();
            expect(notificationWithoutParameters.type).toBeDefined();
            expect(notificationWithoutParameters.flush).toBeDefined();
            expect(notificationWithoutParameters.buttonText).toBeDefined();
            expect(notificationWithoutParameters.autoDismiss).toBeUndefined();
            expect(notificationWithoutParameters.text).toEqual('text');
            expect(notificationWithoutParameters.icon).toEqual('');
            expect(notificationWithoutParameters.type).toEqual(AlNotificationType.Error);
            expect(notificationWithoutParameters.flush).toEqual(false);
            expect(notificationWithoutParameters.buttonText).toEqual('');
        });
    });

    describe('WHEN the success() static method is called', () => {
        let notification: AlNotification = AlNotification.success('text', 1000, true, 'home', 'button text');
        let notificationWithoutParameters: AlNotification = AlNotification.success('text');
        it('SHOULD match with initial types and values', () => {

            expect(notification.text).toBeDefined();
            expect(notification.icon).toBeDefined();
            expect(notification.type).toBeDefined();
            expect(notification.flush).toBeDefined();
            expect(notification.buttonText).toBeDefined();
            expect(notification.autoDismiss).toBeDefined();
            expect(notification.text).toEqual('text');
            expect(notification.icon).toEqual('home');
            expect(notification.type).toEqual(AlNotificationType.Success);
            expect(notification.flush).toEqual(true);
            expect(notification.buttonText).toEqual('button text');
            expect(notification.autoDismiss).toEqual(1000);
        });
        it('SHOULD match with initial types and values without parameters', () => {

            expect(notificationWithoutParameters.text).toBeDefined();
            expect(notificationWithoutParameters.icon).toBeDefined();
            expect(notificationWithoutParameters.type).toBeDefined();
            expect(notificationWithoutParameters.flush).toBeDefined();
            expect(notificationWithoutParameters.buttonText).toBeDefined();
            expect(notificationWithoutParameters.autoDismiss).toBeUndefined();
            expect(notificationWithoutParameters.text).toEqual('text');
            expect(notificationWithoutParameters.icon).toEqual('');
            expect(notificationWithoutParameters.type).toEqual(AlNotificationType.Success);
            expect(notificationWithoutParameters.flush).toEqual(false);
            expect(notificationWithoutParameters.buttonText).toEqual('');
        });
    });
});
